import React, { useState } from 'react';
import { GolferProfile } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Shield, User, Search, Filter, ShieldCheck } from 'lucide-react';

interface UsersManagementProps {
  profiles: GolferProfile[];
  onToggleRole: (user: GolferProfile) => void;
  onToggleStatus: (user: GolferProfile) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  profiles,
  onToggleRole,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'member' | 'admin'>('all');

  const filtered = profiles.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.homeClub.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || p.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-2xl font-bold text-forest-950">
            Golfer & Member Management
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            View active subscriptions, handicap ratings, and assign administrative roles.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ink-400" />
            <input
              type="text"
              placeholder="Search golfers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-cream-100 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 w-44 sm:w-56"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-cream-100 border border-stone-300 rounded-lg text-ink-800 focus:outline-none focus:ring-2 focus:ring-forest-700"
          >
            <option value="all">All Roles</option>
            <option value="member">Members</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-[10px] uppercase font-mono tracking-wider text-ink-400">
              <th className="pb-3 pl-2">Golfer</th>
              <th className="pb-3">Handicap / Club</th>
              <th className="pb-3">Membership Tier</th>
              <th className="pb-3">Total Donated</th>
              <th className="pb-3">Role</th>
              <th className="pb-3 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/80">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-cream-100/60 transition-colors">
                <td className="py-3.5 pl-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-forest-900/10"
                    />
                    <div>
                      <p className="font-bold text-forest-950">{user.fullName}</p>
                      <p className="text-[11px] text-ink-500 font-mono">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5">
                  <p className="font-bold text-forest-900">Index: {user.handicapIndex}</p>
                  <p className="text-[11px] text-ink-500">{user.homeClub}</p>
                </td>

                <td className="py-3.5">
                  <Badge variant={user.membershipTier === 'yearly' ? 'lime' : 'stone'} size="sm">
                    {user.membershipTier.toUpperCase()}
                  </Badge>
                </td>

                <td className="py-3.5 font-serif font-bold text-sm text-emerald-800">
                  ${user.totalDonated.toFixed(2)}
                </td>

                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                    user.role === 'admin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-forest-100 text-forest-900'
                  }`}>
                    {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {user.role.toUpperCase()}
                  </span>
                </td>

                <td className="py-3.5 pr-2 text-right">
                  <button
                    onClick={() => onToggleRole(user)}
                    className="text-[11px] font-semibold text-forest-900 hover:text-forest-700 underline underline-offset-2 ml-2"
                  >
                    {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
