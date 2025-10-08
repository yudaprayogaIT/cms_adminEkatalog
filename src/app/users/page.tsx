// src/app/users/page.tsx
import React from 'react';
import UserList from '@/components/users/UserList';
import Hero from '@/components/users/Hero';

export const metadata = {
  title: 'Users - Admin Pengelola Ekatalog',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <Hero />
      <div className="bg-white rounded-xl shadow p-6">
        <UserList />
      </div>
    </div>
  );
}
