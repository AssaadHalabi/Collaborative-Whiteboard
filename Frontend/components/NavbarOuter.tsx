"use client";
import Link from "next/link";
import Image from "next/image";
import React from 'react'




export const NavbarOuter = () => {
  return (
    <header className="bg-primary-black px-4 lg:px-6 h-14 flex items-center justify-between">
      <Link href="#" className="flex items-center gap-2" prefetch={false}>
        <Image src="/assets/logos.svg" alt="Collaboard Logo" width={140} height={100} />
      </Link>
      <p className="text-primary-foreground text-sm font-medium">Collaborative Whiteboard</p>
    </header>
  )
}

export default NavbarOuter