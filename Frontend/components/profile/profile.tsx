"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { UsersIcon } from "./UsersIcon";
import useAuth from "@/hooks/useAuth";
import Loader from "../Loader";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Icons } from "@/components/ui/icons";
import { NavbarOuter } from "../NavbarOuter";
import Link from "next/link";
import axios from "axios";

const roomsPerPage = 2;

export function Profile() {
  const { loading, authenticated, email } = useAuth();
  const router = useRouter();

  const [ownedRooms, setOwnedRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [ownedRoomsPage, setOwnedRoomsPage] = useState(1);
  const [joinedRoomsPage, setJoinedRoomsPage] = useState(1);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomUserName, setJoinRoomUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState("");
  const [ownedRoomsLoading, setOwnedRoomsLoading] = useState(true);
  const [joinedRoomsLoading, setJoinedRoomsLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [avatarImage, setAvatarImage] = useState(null);
  // const [avatarURL, setAvatarUrl] = useState("/placeholder-user.jpg");
  const [avatarURL, setAvatarUrl] = useState(`/assets/avatar-${Math.floor(Math.random() * 30)}.png`);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/authentication");
    }
  }, [loading, authenticated, router]);

  useEffect(() => {
    if (authenticated) {
      fetchOwnedRooms();
      fetchJoinedRooms();
      fetchSubscriptionStatus();
      fetchUserProfile();
    }
  }, [authenticated, ownedRoomsPage, joinedRoomsPage]);

  const fetchOwnedRooms = async () => {
    setOwnedRoomsLoading(true);
    try {
      const response = await api.get("/api/owned_rooms");
      setOwnedRooms(response.data);
    } catch (error) {
      console.error("Error fetching owned rooms:", error);
    } finally {
      setOwnedRoomsLoading(false);
    }
  };

  const fetchJoinedRooms = async () => {
    setJoinedRoomsLoading(true);
    try {
      const response = await api.get("/api/joined_rooms");
      setJoinedRooms(response.data);
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
    } finally {
      setJoinedRoomsLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    setSubscriptionLoading(true);
    try {
      const response = await api.get("/api/subscriptions/status");
      setSubscription(response.data);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await api.get(`/api/users/${email}`);
      if (response.data.avatarURL) {
        setAvatarUrl(response.data.avatarURL);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    router.push("/");
  };

  const handleJoinRoom = (roomId, userName) => {
    setJoinRoomId(roomId);
    setJoinRoomUserName(userName);
    setIsJoinModalOpen(true);
  };

  const handleJoinRoomSubmit = async () => {
    if (joinRoomUserName) {
      setJoinLoading(true);
      try {
        await api.post(`/api/rooms/${joinRoomId}/join`, { userName: joinRoomUserName });
        fetchJoinedRooms();
        setIsJoinModalOpen(false);
        setErrorMessage("");
        router.push(`/room/${joinRoomId}`);
      } catch (error) {
        console.error("Error joining room:", error);
        setErrorMessage("Failed to join the room. Please try again.");
      } finally {
        setJoinLoading(false);
      }
    }
  };

  const handleDeleteRoom = async (roomId) => {
    setDeleteLoading(roomId);
    try {
      await api.delete(`/api/rooms/${roomId}`);
      fetchOwnedRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setDeleteLoading("");
    }
  };

  const paginate = (rooms, page) => {
    const startIndex = (page - 1) * roomsPerPage;
    return rooms.slice(startIndex, startIndex + roomsPerPage);
  };

  const totalOwnedPages = Math.ceil(ownedRooms.length / roomsPerPage);
  const totalJoinedPages = Math.ceil(joinedRooms.length / roomsPerPage);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarImage(file);
      try {
        setUploadingAvatar(true);
        const response = await api.post("/api/generate-upload-url", {
          avatarImageName: file.name,
          avatarImageType: file.type,
        });
        const { url } = response.data;
        await axios.put(url, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
        await api.put(`/api/users/${email}`, {
          avatarImageName: file.name,
        });
        setAvatarUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error updating avatar:", error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  return (
    <>
      <NavbarOuter />
      {loading ? (
        <Loader />
      ) : (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8">
            <div className="bg-background rounded-lg p-6 shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {profileLoading ? (
                      <Icons.spinner className="h-16 w-16 animate-spin" />
                    ) : (
                      <>
                        <AvatarImage src={avatarURL} alt="User Avatar" />
                        <AvatarFallback>{email.charAt(0).toUpperCase()}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-semibold">{email}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-accent-foreground/10 hover:text-accent-foreground/80"
                  onClick={() => document.getElementById("avatarInput").click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Change Avatar
                </Button>
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mt-4">
                  <Link
                    href="/authentication/forgot-password"
                    className="underline underline-offset-4 text-blue-600 hover:text-blue-800"
                  >
                    Change Password
                  </Link>
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Owned Rooms</div>
                <Button variant="black" size="sm" onClick={handleCreateRoom} disabled={joinLoading}>
                  {joinLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Create Room
                </Button>
              </div>
              {ownedRoomsLoading ? (
                <div className="flex justify-center">
                  <Icons.spinner className="mr-2 h-6 w-6 animate-spin" />
                </div>
              ) : ownedRooms.length > 0 ? (
                <>
                  <div className="grid gap-4">
                    {paginate(ownedRooms, ownedRoomsPage).map((room) => {
                      const userRoom = room.users.find(
                        (userRoom) => userRoom.userEmail === email
                      );
                      return (
                        <Card key={room.id} className="bg-muted p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">Room ID: {room.id}</div>
                              <div className="text-muted-foreground">{room.ownerEmail}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <UsersIcon className="w-5 h-5" />
                              <div>{room.users.length}</div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-accent-foreground/10 hover:text-accent-foreground/80"
                              onClick={() => handleJoinRoom(room.id, userRoom.userName)}
                              disabled={joinLoading}
                            >
                              {joinLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                              Join
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRoom(room.id)}
                              disabled={deleteLoading === room.id}
                            >
                              {deleteLoading === room.id && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setOwnedRoomsPage((prev) => Math.max(prev - 1, 1));
                            }}
                            isActive={ownedRoomsPage !== 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalOwnedPages }, (_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              href="#"
                              isActive={ownedRoomsPage === index + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                setOwnedRoomsPage(index + 1);
                              }}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setOwnedRoomsPage((prev) => Math.min(prev + 1, totalOwnedPages));
                            }}
                            isActive={ownedRoomsPage !== totalOwnedPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">No Rooms Owned</div>
              )}
            </div>

            <div className="bg-background rounded-lg p-6 shadow">
              <div className="font-semibold mb-4">Joined Rooms</div>
              {joinedRoomsLoading ? (
                <div className="flex justify-center">
                  <Icons.spinner className="mr-2 h-6 w-6 animate-spin" />
                </div>
              ) : joinedRooms.length > 0 ? (
                <>
                  <div className="grid gap-4">
                    {paginate(joinedRooms, joinedRoomsPage).map((room) => {
                      const userRoom = room.users.find(
                        (userRoom) => userRoom.userEmail === email
                      );
                      return (
                        <Card key={room.id} className="bg-muted p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">Room ID: {room.id}</div>
                              <div className="text-muted-foreground">
                                <span className="font-semibold">Owner:</span> {room.ownerEmail}
                              </div>
                              <div className="text-muted-foreground">
                                <span className="font-semibold">Username:</span> {userRoom.userName}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-4 hover:bg-accent-foreground/10 hover:text-accent-foreground/80"
                                onClick={() => handleJoinRoom(room.id, userRoom.userName)}
                                disabled={joinLoading}
                              >
                                {joinLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Join
                              </Button>
                              <UsersIcon className="w-5 h-5" />
                              <div>{room.users.length}</div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setJoinedRoomsPage((prev) => Math.max(prev - 1, 1));
                            }}
                            isActive={joinedRoomsPage !== 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalJoinedPages }, (_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              href="#"
                              isActive={joinedRoomsPage === index + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                setJoinedRoomsPage(index + 1);
                              }}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setJoinedRoomsPage((prev) => Math.min(prev + 1, totalJoinedPages));
                            }}
                            isActive={joinedRoomsPage !== totalJoinedPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">No Joined Rooms</div>
              )}
            </div>

            <div className="bg-background rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Subscription</div>
                {subscriptionLoading ? (
                  <Icons.spinner className="mr-2 h-6 w-6 animate-spin" />
                ) : !subscription && (
                  <Button variant="green">Subscribe</Button>
                )}
              </div>
              <div className="grid gap-2">
                {subscription ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">Status:</div>
                      <div className="font-semibold">{subscription.status}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">Type:</div>
                      <div className="font-semibold">{subscription.type}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-muted-foreground">Valid Until:</div>
                      <div>{new Date(subscription.validUntil).toLocaleDateString()}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">No active subscription</div>
                )}
              </div>
            </div>
          </div>

          <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
            <DialogContent>
              <DialogTitle>Join Room</DialogTitle>
              <div className="mt-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={joinRoomUserName}
                  onChange={(e) => setJoinRoomUserName(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              {errorMessage && (
                <div className="mt-2 text-sm text-red-600">{errorMessage}</div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleJoinRoomSubmit} variant="black" disabled={joinLoading}>
                  {joinLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Join
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}

export default Profile;
