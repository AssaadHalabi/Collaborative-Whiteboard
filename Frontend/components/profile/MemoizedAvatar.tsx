import React, { memo } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Icons } from '../ui/icons';

const MemoizedAvatar = ({profileLoading, avatarURL}: {profileLoading:boolean; avatarURL:string}) => {
  return (
    
    <Avatar className="w-16 h-16">
                    {profileLoading ? (
                      <Icons.spinner className="h-16 w-16 animate-spin" />
                    ) : (
                      <>
                        <AvatarImage src={avatarURL} alt="User Avatar" />
                        <AvatarFallback><Icons.spinner className="h-16 w-16 animate-spin" /></AvatarFallback>
                      </>
                    )}
                  </Avatar>
  )
}

export default memo(MemoizedAvatar, (prevProps, nextProps) => prevProps.avatarURL === nextProps.avatarURL)