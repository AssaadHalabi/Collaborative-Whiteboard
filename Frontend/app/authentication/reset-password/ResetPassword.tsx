"use client"

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/authentication/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { Icons } from '@/components/ui/icons';

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/reset-password', { token, newPassword });
      setMessage(response.data.message);
      if (response.data.message === 'Password reset successful') {
        router.push('/authentication'); // Redirect to authentication page after successful reset
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-md">
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            <Input
              id="newPassword"
              placeholder="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="px-3 py-2 border rounded-md"
              disabled={isLoading}
            />
            {message && <p className="text-green-600 text-center">{message}</p>}
            {error && <p className="text-red-600 text-center">{error}</p>}
            <Button className="w-full py-2 bg-black text-white rounded-md hover:bg-accent-foreground/90" type="submit" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
