"use client";

import Room from "@/app/room/[roomId]/Room";
import { TooltipProvider } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

/**
 * disable ssr to avoid pre-rendering issues of Next.js
 *
 * we're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */
const Board = dynamic(() => import("./Board"), { ssr: false });

import React from 'react'

const RoomPage = () => {

  const params = useParams<{ roomId: string;  }>();
  const { roomId } = params;
  if (Array.isArray(roomId)) throw new Error(`roomId should be a string not an array /room/[roomId] \n provided value: ${JSON.stringify(roomId, null, 2)}`)

  return (
    <Room roomId={roomId}>
    <TooltipProvider>
        <Board />
    </TooltipProvider>
  </Room>
  )
}

export default RoomPage;
