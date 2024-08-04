"use client";

import Room from "@/app/room/[roomId]/Room";
import Loader from "@/components/Loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

/**
 * disable ssr to avoid pre-rendering issues of Next.js
 *
 * we're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */
const Board = dynamic(() => import("./Board"), {
  ssr: false,
  loading: () => <Loader />
});

import React, { useEffect, useState } from 'react';

const RoomPage = () => {
  const params = useParams<{ roomId: string; }>();
  const { roomId } = params;
  if (Array.isArray(roomId)) throw new Error(`roomId should be a string not an array /room/[roomId] \n provided value: ${JSON.stringify(roomId, null, 2)}`);
  const { loading, authenticated, email } = useAuth();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userRooms, status, statusText } = await api.get(`/api/rooms/${roomId}/users`);

        if (status !== 200) {
          throw new Error(`Error: ${userRooms.error} ${statusText}`);
        }

        const user = userRooms.find((userRoom: any) => userRoom.userEmail === email);
        if (user) {
          setUserName(user.userName);
          console.log("userName");
          alert(user.userName);
        } else {
          throw new Error("User not found in room data");
        }

      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };
    if (authenticated && email) fetchData();
  }, [roomId, email]);

  if (loading) {
    return <Loader />;
  }
  if (!authenticated) return null;

  return (
    <Room roomId={roomId}>
      <TooltipProvider>
        <Board email={email} roomId={roomId} userName={userName} />
      </TooltipProvider>
    </Room>
  );
}

export default RoomPage;
