"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/authentication/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Icons } from "@/components/ui/icons";
import NavbarOuter from "@/components/NavbarOuter";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/api/reset-password", {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      if (response.data.message === "Password reset successful") {
        router.push("/authentication"); // Redirect to authentication page after successful reset
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavbarOuter />
      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4'>
        <div className='w-full max-w-md rounded-md bg-white p-8 shadow-lg'>
          <h2 className='text-center text-2xl font-semibold'>Reset Password</h2>
          <form onSubmit={handleSubmit} className='mt-4'>
            <div className='grid gap-4'>
              <Input
                id='newPassword'
                placeholder='New Password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className='rounded-md border px-3 py-2'
                disabled={isLoading}
              />
              {message && (
                <p className='text-center text-green-600'>{message}</p>
              )}
              {error && <p className='text-center text-red-600'>{error}</p>}
              <Button
                className='w-full rounded-md bg-black py-2 text-white hover:bg-accent-foreground/90'
                type='submit'
                disabled={isLoading}
              >
                {isLoading && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
