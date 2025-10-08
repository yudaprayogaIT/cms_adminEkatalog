// src/app/users/page.tsx
import React from 'react';
import AdminList from '@/components/users/AdminList';
import Hero from '@/components/users/Hero';

export const metadata = {
  title: 'Users - Admin Pengelola',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Hero />
      <div className="bg-white rounded-xl shadow p-6">
        <AdminList />
      </div>
    </div>
  );
}
