"use client";
import { Metadata } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/authentication/button";
import { UserAuthForm } from "@/app/authentication/UserAuthForm";
import { Button } from "@/components/ui/button";
import NavbarOuter from "@/components/NavbarOuter";
import useAuth from "@/hooks/useAuth";
import Loader from "@/components/Loader";

const metadata: Metadata = {
  title: "CollaBoard - Auth",
  description: "CollaBoard Authentication Page.",
};

export default function AuthenticationPage() {
  const { loading, authenticated } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (!loading && authenticated) {
      router.push("/profile");
    }
  }, [loading, authenticated, router]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  if (loading) return <Loader />;

  return (
    <>
      <NavbarOuter />

      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4'>
        <div className='w-full max-w-md rounded-md bg-white p-8 shadow-lg'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {isLogin ? "Sign In" : "Create an account"}
            </h1>
            <p className='text-sm text-gray-600'>
              {isLogin
                ? "Enter your email and password to sign in"
                : "Enter your email and password to create an account"}
            </p>
          </div>
          <UserAuthForm className='mt-2' isLogin={isLogin} />
          {isLogin && (
            <p className='mt-4 text-center text-sm text-gray-600'>
              <Link
                href='/authentication/forgot-password'
                className='text-blue-600 underline underline-offset-4 hover:text-blue-800'
              >
                Forgot Password?
              </Link>
            </p>
          )}
          <p className='mt-4 text-center text-sm text-gray-600'>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button
              onClick={toggleAuthMode}
              variant='link'
              className='ml-2 text-blue-600 underline underline-offset-4 hover:text-blue-800'
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Button>
          </p>
          <p className='mt-4 px-8 text-center text-sm text-gray-600'>
            By clicking continue, you agree to our{" "}
            <Link
              // href="/terms"
              href='/soon'
              className='text-blue-600 underline underline-offset-4 hover:text-blue-800'
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              // href="/privacy"
              href='/soon'
              className='text-blue-600 underline underline-offset-4 hover:text-blue-800'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
