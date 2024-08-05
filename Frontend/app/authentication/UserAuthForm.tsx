"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation' // Note: Changed to next/navigation for useRouter
import api from '@/lib/axios'

import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/authentication/button"
import { Input } from "@/components/authentication/input"
import { Label } from "@/components/authentication/label"
import axios from "axios"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isLogin: boolean;
}

export function UserAuthForm({ className, isLogin, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [avatarUri, setAvatarUri] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const response = await api.post('/api/login', { email, password });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      } else {
        await api.post('/api/users', { email, password, avatarUri });
      }
      router.push('/');  // Redirect to the lobby or another page
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const { data } = err.response;
          if (data.errors) {
            setError(data.errors.map((error: any) => error.msg).join(', '));
          } else if (data.message) {
            setError(data.message);
          }
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Your password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 border rounded-md"
              required
            />
          </div>

          {!isLogin && (
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="avatarUri">
                Avatar URI
              </Label>
              <Input
                id="avatarUri"
                placeholder="Avatar URI"
                type="text"
                autoCapitalize="none"
                autoComplete="avatarUri"
                autoCorrect="off"
                disabled={isLoading}
                value={avatarUri}
                onChange={(e) => setAvatarUri(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm mt-2">
              {error}
            </div>
          )}
          
          <Button 
            className="w-full py-2 bg-black text-white rounded-md hover:bg-accent-foreground/90"
            disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLogin ? "Sign In" : "Sign Up"} with Email
          </Button>
        </div>
      </form>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
    </div>
  )
}
