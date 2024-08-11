"use client";

import Image from "next/image";
import { memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { navElements } from "@/constants";
import { ActiveElement, NavbarProps } from "@/types/type";
import { Button } from "./ui/button";
import ShapesMenu from "./ShapesMenu";
import ActiveUsers from "./users/ActiveUsers";
import { NewThread } from "./comments/NewThread";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/axios";

const Navbar = ({
  activeElement,
  imageInputRef,
  handleImageUpload,
  handleActiveElement,
  roomId,
  email,
  userName,
  avatarURL,
}: NavbarProps) => {
  const router = useRouter();

  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));
  const handleSignOut = async () => {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null;
      if (refreshToken) {
        await api.post("/api/logout", { token: refreshToken });
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
        router.push("/authentication");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <nav className='flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white'>
      <div className='flex items-center'>
        <Link href='/' prefetch={false}>
          <Image
            src='/assets/logos.svg'
            alt='Collaboard Logo'
            width={140}
            height={100}
          />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className='ml-4 text-white'>
              <MenuIcon className='h-6 w-6' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='bg-primary-black'>
            <DropdownMenuItem
              className='block w-full p-2 text-white hover:bg-primary-green'
              asChild
            >
              <Link
                href='/'
                className='block w-full p-2 text-sm font-medium text-white'
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
                className='block w-full p-2 text-sm font-medium text-white'
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
                className='block w-full p-2 text-sm font-medium text-white'
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
                className='block w-full p-2 text-sm font-medium text-white'
              >
                Coming Soon
              </Link>
            </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ul className='flex flex-row'>
        {navElements.map((item: ActiveElement | any) => (
          <li
            key={item.name}
            onClick={() => {
              if (Array.isArray(item.value)) return;
              handleActiveElement(item);
            }}
            className={`group flex items-center justify-center px-2.5 py-5
            ${isActive(item.value) ? "bg-primary-green" : "hover:bg-primary-grey-200"}
            `}
          >
            {/* If value is an array means it's a nav element with sub options i.e., dropdown */}
            {Array.isArray(item.value) ? (
              <ShapesMenu
                item={item}
                activeElement={activeElement}
                imageInputRef={imageInputRef}
                handleActiveElement={handleActiveElement}
                handleImageUpload={handleImageUpload}
              />
            ) : item?.value === "comments" ? (
              // If value is comments, trigger the NewThread component
              <NewThread>
                <Button className='relative h-5 w-5 object-contain'>
                  <Image
                    src={item.icon}
                    alt={item.name}
                    fill
                    className={isActive(item.value) ? "invert" : ""}
                  />
                </Button>
              </NewThread>
            ) : (
              <Button className='relative h-5 w-5 object-contain'>
                <Image
                  src={item.icon}
                  alt={item.name}
                  fill
                  className={isActive(item.value) ? "invert" : ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ActiveUsers
        roomId={roomId}
        email={email}
        userName={userName}
        avatarURL={avatarURL}
      />
    </nav>
  );
};

export default memo(
  Navbar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
