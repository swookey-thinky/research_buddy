'use client';

import React from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export function LoginButton() {
  const { signIn } = useAuth();

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={signIn}
        className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <LogIn className="w-5 h-5" />
        Sign in with Google
      </button>
    </div>
  );
}