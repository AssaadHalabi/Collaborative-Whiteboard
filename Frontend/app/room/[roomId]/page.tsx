"use client";

import Room from "@/app/room/[roomId]/Room";
import Loader from "@/components/Loader";
import { TooltipProvider } from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Disable SSR to avoid pre-rendering issues of Next.js
 * because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */
const Board = dynamic(() => import("./Board"), {
  ssr: false,
  loading: () => <Loader />
});

const RoomPage = () => {
  const params = useParams<{ roomId: string; }>();
  const { roomId } = params;
  if (Array.isArray(roomId)) throw new Error(`roomId should be a string not an array /room/[roomId] \n provided value: ${JSON.stringify(roomId, null, 2)}`);
  
  const { loading: authLoading, authenticated, email } = useAuth();
  const [userName, setUserName] = useState<string>("");
  // const [avatarURL, setAvatarUrl] = useState<string>("/placeholder-user.jpg");
  const [avatarURL, setAvatarUrl] = useState<string>(`/assets/avatar-${Math.floor(Math.random() * 30)}.png`);
  const [fetchingRoomData, setFetchingRoomData] = useState<boolean>(true);
  const [fetchingUserProfile, setFetchingUserProfile] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data: userRooms, status, statusText } = await api.get(`/api/rooms/${roomId}/users`);
        if (status !== 200) {
          throw new Error(`Error: ${userRooms.error} ${statusText}`);
        }

        const user = userRooms.find((userRoom: any) => userRoom.userEmail === email);
        if (user) {
          setUserName(user.userName);
        } else {
          throw new Error("User not found in room data");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      } finally {
        setFetchingRoomData(false);
      }
    };

    if (authenticated && email) {
      fetchRoomData();
    }
  }, [roomId, email, authenticated]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`/api/users/${email}`);
        if (response.data.avatarURL) {
          setAvatarUrl(response.data.avatarURL);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setFetchingUserProfile(false);
      }
    };

    if (authenticated && email) {
      fetchUserProfile();
    }
  }, [authenticated, email]);

  useEffect(() => {
    if (!authLoading && !authenticated) {
      router.push("/authentication");
    }
  }, [authLoading, authenticated, router]);

  if (authLoading || fetchingRoomData || fetchingUserProfile) {
    return <Loader />;
  }

  return (
    <Room roomId={roomId} email={email} userName={userName} avatarURL={avatarURL}>
      <TooltipProvider>
        <Board email={email} roomId={roomId} userName={userName} avatarURL={avatarURL} />
      </TooltipProvider>
    </Room>
  );
}

export default RoomPage;
