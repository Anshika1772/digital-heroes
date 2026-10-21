// Polyfill localStorage in Node test environment
if (typeof localStorage === 'undefined' || localStorage === null) {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { runValidationAudit } from './validation-audit';

console.log('--- DIGITAL HEROES VALIDATION & ERROR-HANDLING AUDIT ---');
const { passed, failed, results } = runValidationAudit();
results.forEach(r => console.log(r));
console.log('---------------------------------------------------------');
console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL VALIDATION AUDIT TESTS COMPLETED SUCCESSFULLY.');
}
