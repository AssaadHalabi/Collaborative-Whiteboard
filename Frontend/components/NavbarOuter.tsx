"use client";
import Link from "next/link";
import Image from "next/image";
import React from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MenuIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NavbarOuter = () => {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (refreshToken) {
        api.post('/api/logout', { token: refreshToken });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        router.replace('/authentication');
        // window?.replace('/authentication');
        
      }
      router.replace('/authentication');
        // window?.replace('/authentication');
      
    } catch (error: any) {
      console.error('Error logging out:', error);
      router.replace('/authentication');
        // window?.replace('/authentication');
      
      if (error.message === "Token is required") router.replace('/authentication');
    }
  };

  return (
    <header className="bg-primary-black px-4 lg:px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <Image src="/assets/logos.svg" alt="Collaboard Logo" width={140} height={100} />
      </Link>
      <nav className="hidden lg:flex gap-4">
        <Link href="/" className="text-white text-sm font-medium hover:text-accent-foreground">
          <Button className="hover:bg-primary-green" variant="link">Lobby</Button>
        </Link>
        <Link href="/pricing" className="text-white text-sm font-medium hover:text-accent-foreground">
          <Button className="hover:bg-primary-green" variant="link">Pricing</Button>
        </Link>
        <Link href="/profile" className="text-white text-sm font-medium hover:text-accent-foreground">
          <Button className="hover:bg-primary-green" variant="link">Profile</Button>
        </Link>
        <Link href="/soon" className="text-white text-sm font-medium hover:text-accent-foreground">
          <Button className="hover:bg-primary-green" variant="link">Coming Soon</Button>
        </Link>
        {!loading && (
          authenticated ? (
            <Button className="hover:bg-primary-green text-white" variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Link href="/authentication" className="text-white text-sm font-medium">
              <Button className="hover:bg-primary-green" variant="outline">Sign In</Button>
            </Link>
          )
        )}
      </nav>
      <div className="lg:hidden flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-primary-green text-white w-full block p-2" asChild>
            <Button className="text-white">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-primary-black">
            <DropdownMenuItem className="hover:bg-primary-green text-white w-full block p-2" asChild>
              <Link href="/" className="text-white text-sm font-medium hover:text-accent-foreground hover:bg-primary-green block w-full p-2">
                Lobby
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary-green text-white w-full block p-2" asChild>
              <Link href="/pricing" className="text-white text-sm font-medium hover:text-accent-foreground hover:bg-primary-green block w-full p-2">
                Pricing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary-green text-white w-full block p-2" asChild>
              <Link href="/profile" className="text-white text-sm font-medium hover:text-accent-foreground hover:bg-primary-green block w-full p-2">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary-green text-white w-full block p-2" asChild>
              <Link href="/soon" className="text-white text-sm font-medium hover:text-accent-foreground hover:bg-primary-green block w-full p-2">
                Coming Soon
              </Link>
            </DropdownMenuItem>
            {!loading && (
              authenticated ? (
                <DropdownMenuItem className="hover:bg-primary-green text-white w-full block p-2" asChild>
                  <Button className="hover:bg-primary-green text-white w-full block p-2" variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="hover:bg-primary-green text-white w-full block p-2" asChild>
                  <Link href="/authentication" className="text-white text-sm font-medium">
                    <Button className="hover:bg-primary-green w-full block p-2" variant="outline">Sign In</Button>
                  </Link>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default NavbarOuter;
