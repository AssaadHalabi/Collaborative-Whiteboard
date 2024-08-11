"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ChromeIcon } from "./ChromeIcon";
import { ClapperboardIcon } from "./ClapperboardIcon";
import { useEffect, useState } from "react";
import { Icons } from "@/components/ui/icons";
import api from "@/lib/axios";
import NavbarOuter from "../NavbarOuter";
import useAuth from "@/hooks/useAuth"; // Import the useAuth hook
import Loader from "../Loader";

export function Lobby() {
  const router = useRouter();
  const { authenticated, loading: authLoading } = useAuth(); // Get authentication status and loading state from the useAuth hook
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [action, setAction] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch('https://api.liveblocks.io/v2/rooms', {
  //         method: 'GET', // or 'POST', 'PUT', etc., depending on the API endpoint requirements
  //         headers: {
  //           'Authorization': `Bearer ${process.env.NEXT_PUBLIC_LIVEBLOCKS_SECRET_KEY!}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status} ${response.statusText}`);
  //       }

  //       const data = await response.json();
  //       console.log(data);

  //     } catch (error) {
  //       if (error instanceof Error) {
  //         console.error(error.message);
  //       }
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleSubmit = async () => {
    if (!authenticated) {
      router.push("/authentication");
      return;
    }

    if (room) {
      setLoading(true);
      setError(null);
      try {
        if (action === "create") {
          const createRoomResponse = await api.post("/api/rooms", {
            id: room,
            userName: name,
          });
        } else {
          const joinRoomResponse = await api.post(`/api/rooms/${room}/join`, {
            userName: name,
          });
        }
        router.push(`/room/${room}`);
      } catch (error: any) {
        console.log(error);
        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "An error occurred"
        );
        setLoading(false);
      }
    }
  };

  if (authLoading) return <Loader />;

  return (
    <>
      <NavbarOuter />

      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4'>
        <div className='mb-12 w-full min-w-fit max-w-md rounded-md bg-white p-8 shadow-lg'>
          <h2 className='text-center text-2xl font-semibold capitalize'>
            {action} Room
          </h2>
          <div className='mt-4 grid gap-4'>
            <div>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                placeholder='Enter your name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='bg-primary'
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor='room'>Room Name</Label>
              <Input
                id='room'
                placeholder='Enter room name'
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className='bg-primary'
                disabled={loading}
              />
            </div>
            <div className='mt-4 flex items-center justify-between'>
              <RadioGroup
                defaultValue='create'
                className='flex items-center gap-2'
                onValueChange={setAction}
              >
                <Label
                  htmlFor='join'
                  className='flex cursor-pointer items-center gap-2 rounded-md border p-2 [&:has(:checked)]:bg-muted'
                >
                  <RadioGroupItem id='join' value='join' disabled={loading} />
                  Join
                </Label>
                <Label
                  htmlFor='create'
                  className='flex cursor-pointer items-center gap-2 rounded-md border p-2 [&:has(:checked)]:bg-muted'
                >
                  <RadioGroupItem
                    id='create'
                    value='create'
                    disabled={loading}
                  />
                  Create
                </Label>
              </RadioGroup>
              <Button
                className='bg-black capitalize text-white hover:bg-accent-foreground/90'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                {action} Room
              </Button>
            </div>
            {loading && (
              <p className='mt-4 text-center text-gray-600'>Loading...</p>
            )}
            {error && <p className='mt-4 text-center text-red-600'>{error}</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Lobby;
