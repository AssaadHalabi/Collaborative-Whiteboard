"use client"
import { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/authentication/button"
import { UserAuthForm } from "@/app/authentication/UserAuthForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import NavbarOuter from "@/components/NavbarOuter"

const metadata: Metadata = {
  title: "CollaBoard - Auth",
  description: "CollaBoard Authentication Page.",
}

export default function AuthenticationPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
<NavbarOuter />

      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-md">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isLogin ? "Sign In" : "Create an account"}
            </h1>
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Enter your email and password to sign in"
                : "Enter your email and password to create an account"}
            </p>
          </div>
          <UserAuthForm className="mt-2" isLogin={isLogin} />
          {isLogin && (
            <p className="text-center text-sm text-gray-600 mt-4">
              <Link
                href="/authentication/forgot-password"
                className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </Link>
            </p>
          )}
          <p className="text-center text-sm text-gray-600 mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Button
              onClick={toggleAuthMode}
              variant="link"
              className="ml-2 underline underline-offset-4 text-blue-600 hover:text-blue-800"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Button>
          </p>
          <p className="px-8 text-center text-sm text-gray-600 mt-4">
            By clicking continue, you agree to our{" "}
            <Link
              // href="/terms"
              href="/soon"
              className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              // href="/privacy"
              href="/soon"
              className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
