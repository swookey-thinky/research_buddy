'use client';

import React from 'react';
import Image from 'next/image';
import { LogOut, User as UserIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/help"
        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-sm">Help</span>
      </Link>

      <div className="relative group">
        <div className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-100">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <UserIcon className="w-8 h-8 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.displayName || 'User'}
          </span>
        </div>

        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}