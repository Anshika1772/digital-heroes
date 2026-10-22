import { supabase, isSupabaseConfigured } from './supabase';

export const PROOF_BUCKET = 'winner-proofs';
export const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_PROOF_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export interface UploadProofResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  isDemo?: boolean;
  error?: string;
}

/**
 * Validates the file format and size for scorecard/winner proof documents.
 */
export function validateProofFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a scorecard or verification document.' };
  }

  if (!ALLOWED_PROOF_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format (${file.type || 'unknown'}). Only JPEG, PNG, WEBP images or PDF files are accepted.`,
    };
  }

  if (file.size > MAX_PROOF_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 5.00 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a genuine scorecard or proof document to Supabase Storage with private access controls.
 * Falls back to local object URL only if Supabase credentials are not configured.
 */
export async function uploadWinnerProofFile(
  file: File,
  userId: string,
  winnerId: string
): Promise<UploadProofResult> {
  const validation = validateProofFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // 1. Genuine Supabase Storage Upload
  if (isSupabaseConfigured && supabase) {
    try {
      // Verify authenticated session to ensure storage path matches auth.uid()
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required: You must be signed in with a verified account to upload proof documents to secure storage.',
        };
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Always use the real authenticated user ID as the root folder to strictly satisfy Storage RLS
      const effectiveUserId = user.id;
      const cleanWinnerId = winnerId.replace(/[^a-zA-Z0-9_-]/g, '');
      const storagePath = `${effectiveUserId}/${cleanWinnerId}_${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        // If bucket does not exist or user policy denies, provide actionable error
        console.error('Supabase Storage upload error:', error);
        return {
          success: false,
          error: `Storage Upload Failed: ${error.message}. Ensure the '${PROOF_BUCKET}' bucket exists in your Supabase project.`,
        };
      }

      // Generate a private signed URL valid for 30 days
      const { data: signedData, error: signedError } = await supabase.storage
        .from(PROOF_BUCKET)
        .createSignedUrl(data.path, 60 * 60 * 24 * 30);

      if (signedError || !signedData?.signedUrl) {
        // Fallback to public URL if signed URL fails
        const { data: publicUrlData } = supabase.storage
          .from(PROOF_BUCKET)
          .getPublicUrl(data.path);

        return {
          success: true,
          url: publicUrlData.publicUrl,
          storagePath: data.path,
        };
      }

      return {
        success: true,
        url: signedData.signedUrl,
        storagePath: data.path,
      };
    } catch (err: any) {
      console.error('Unexpected storage upload exception:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during document upload.',
      };
    }
  }

  // 2. Offline Demo Sandbox (when Supabase credentials are intentionally absent)
  try {
    const localUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: localUrl,
      isDemo: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Could not create local file preview.',
    };
  }
}
