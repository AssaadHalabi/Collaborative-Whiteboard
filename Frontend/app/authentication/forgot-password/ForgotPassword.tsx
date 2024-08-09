"use client"

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/authentication/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { Icons } from '@/components/ui/icons';
import NavbarOuter from '@/components/NavbarOuter';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/api/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <NavbarOuter />
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-md">
        <h2 className="text-2xl font-semibold text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            <Input
              id="email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default ForgotPassword;
