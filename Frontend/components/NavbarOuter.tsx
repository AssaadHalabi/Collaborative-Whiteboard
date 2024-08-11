"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import useAuth from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;
      if (refreshToken) {
        api.post("/api/logout", { token: refreshToken });
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        router.replace("/authentication");
        // window?.replace('/authentication');
      }
      router.replace("/authentication");
      // window?.replace('/authentication');
    } catch (error: any) {
      console.error("Error logging out:", error);
      router.replace("/authentication");
      // window?.replace('/authentication');

      if (error.message === "Token is required")
        router.replace("/authentication");
    }
  };

  return (
    <header className='sticky top-0 z-50 flex h-14 items-center justify-between bg-primary-black px-4 lg:px-6'>
      <Link href='/' className='flex items-center gap-2' prefetch={false}>
        <Image
          src='/assets/logos.svg'
          alt='Collaboard Logo'
          width={140}
          height={100}
        />
      </Link>
      <nav className='hidden gap-4 lg:flex'>
        <Link
          href='/'
          className='text-sm font-medium text-white hover:text-accent-foreground'
        >
          <Button className='hover:bg-primary-green' variant='link'>
            Lobby
          </Button>
        </Link>
        <Link
          href='/pricing'
          className='text-sm font-medium text-white hover:text-accent-foreground'
        >
          <Button className='hover:bg-primary-green' variant='link'>
            Pricing
          </Button>
        </Link>
        <Link
          href='/profile'
          className='text-sm font-medium text-white hover:text-accent-foreground'
        >
          <Button className='hover:bg-primary-green' variant='link'>
            Profile
          </Button>
        </Link>
        <Link
          href='/soon'
          className='text-sm font-medium text-white hover:text-accent-foreground'
        >
          <Button className='hover:bg-primary-green' variant='link'>
            Coming Soon
          </Button>
        </Link>
        {!loading &&
          (authenticated ? (
            <Button
              className='text-white hover:bg-primary-green'
              variant='outline'
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          ) : (
            <Link
              href='/authentication'
              className='text-sm font-medium text-white'
            >
              <Button className='hover:bg-primary-green' variant='outline'>
                Sign In
              </Button>
            </Link>
          ))}
      </nav>
      <div className='flex items-center lg:hidden'>
        <DropdownMenu>
          <DropdownMenuTrigger
            className='block w-full p-2 text-white hover:bg-primary-green'
            asChild
          >
            <Button className='text-white'>
              <MenuIcon className='h-6 w-6' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='bg-primary-black'>
            <DropdownMenuItem
              className='block w-full p-2 text-white hover:bg-primary-green'
              asChild
            >
              <Link
                href='/'
                className='block w-full p-2 text-sm font-medium text-white hover:bg-primary-green hover:text-accent-foreground'
              >
                Lobby
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='block w-full p-2 text-white hover:bg-primary-green'
              asChild
            >
              <Link
                href='/pricing'
                className='block w-full p-2 text-sm font-medium text-white hover:bg-primary-green hover:text-accent-foreground'
              >
                Pricing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='block w-full p-2 text-white hover:bg-primary-green'
              asChild
            >
              <Link
                href='/profile'
                className='block w-full p-2 text-sm font-medium text-white hover:bg-primary-green hover:text-accent-foreground'
              >
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='block w-full p-2 text-white hover:bg-primary-green'
              asChild
            >
              <Link
                href='/soon'
                className='block w-full p-2 text-sm font-medium text-white hover:bg-primary-green hover:text-accent-foreground'
              >
                Coming Soon
              </Link>
            </DropdownMenuItem>
            {!loading &&
              (authenticated ? (
                <DropdownMenuItem
                  className='block w-full p-2 text-white hover:bg-primary-green'
                  asChild
                >
                  <Button
                    className='block w-full p-2 text-white hover:bg-primary-green'
                    variant='outline'
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className='block w-full p-2 text-white hover:bg-primary-green'
                  asChild
                >
                  <Link
                    href='/authentication'
                    className='text-sm font-medium text-white'
                  >
                    <Button
                      className='block w-full p-2 hover:bg-primary-green'
                      variant='outline'
                    >
                      Sign In
                    </Button>
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default NavbarOuter;
