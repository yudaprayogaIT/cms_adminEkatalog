import React from 'react';
import BranchList from '@/components/branches/BranchList';

export const metadata = { title: 'Branches - Admin' };

export default function BranchesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <BranchList />
      </div>
    </div>
  );
}
