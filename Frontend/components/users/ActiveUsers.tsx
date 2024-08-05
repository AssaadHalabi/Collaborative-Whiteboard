"use client";

import { useEffect, useMemo, useState } from "react";

import { generateRandomName } from "@/lib/utils";
import { useOthers, useSelf, useUpdateMyPresence } from "@/liveblocks.config";

import Avatar from "./Avatar";
import api from "@/lib/axios";

const ActiveUsers = ({roomId, email, userName}: {roomId:string; email:string; userName:string}) => {
  /**
   * useOthers returns the list of other users in the room.
   *
   * useOthers: https://liveblocks.io/docs/api-reference/liveblocks-react#useOthers
   */
  const others = useOthers();

  
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, status, statusText } = await api.get(`/api/rooms/${roomId}/users`);

        if (status !== 200) {
          throw new Error(`Error: ${data.error} ${statusText}`);
        }

        console.log("data");
        console.log(data);
        
        const names = data.reduce((acc: { [key: string]: string }, user: { userEmail: string; userName: string }) => {
          acc[user.userEmail] = user.userName; // Storing username with email key
          return acc;
        }, {});

        setUserNames(names);
        console.log("names");
        console.log(names);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    fetchData();
  }, [roomId, others.length]);
  

  /**
   * useSelf returns the current user details in the room
   *
   * useSelf: https://liveblocks.io/docs/api-reference/liveblocks-react#useSelf
   */
  const currentUser = useSelf();
  
  const updateMyPresence = useUpdateMyPresence();

  // console.log(`Live currentUser before update currentUser: ${email}`);
  useEffect(() => {
    updateMyPresence({ email, userName, message:userName });
  }, [email, userName, updateMyPresence, others.length]);
  // console.log(`Active users currentUser: ${JSON.stringify(currentUser.presence, null, 2)}`);
  

  // memoize the result of this function so that it doesn't change on every render but only when there are new users joining the room
  const memoizedUsers = useMemo(() => {
    const hasMoreUsers = others.length > 2;

    return (
      <div className='flex items-center justify-center gap-1'>
        {currentUser && (
          <Avatar name={`${(currentUser.presence as any).userName}(You)`} otherStyles='border-[3px] border-primary-green' />
        )}

        {others.slice(0, 2).map(({ connectionId, presence }) => (
          <Avatar
            key={connectionId}
            name={(presence as any).userName || generateRandomName()}
            otherStyles='-ml-3'
          />
        ))}

        {hasMoreUsers && (
          <div className='z-10 -ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-black'>
            +{others.length - 2}
          </div>
        )}
      </div>
    );
  }, [others.length, userName, email, updateMyPresence, (currentUser.presence as any).userName]);

  return memoizedUsers;
};

export default ActiveUsers;
