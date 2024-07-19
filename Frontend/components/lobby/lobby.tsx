import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { ChromeIcon } from "./ChromeIcon"
import { ClapperboardIcon } from "./ClapperboardIcon"

export function Lobby() {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="bg-primary px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <ClapperboardIcon className="size-6 text-primary-foreground" />
          <span className="text-primary-foreground font-semibold">CollaBoard</span>
        </Link>
        <p className="text-primary-foreground text-sm font-medium">Collaborative Whiteboard</p>
      </header>
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-12 flex justify-center">
        <div className="bg-card rounded-lg p-6 space-y-4 w-full max-w-md">
          <h2 className="text-2xl font-bold">Join or Create Room</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>
            <div>
              <Label htmlFor="room">Room Name</Label>
              <Input id="room" placeholder="Enter room name" />
            </div>
            <div className="flex items-center justify-between">
              <RadioGroup defaultValue="join" className="flex items-center gap-2">
                <Label
                  htmlFor="join"
                  className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-muted"
                >
                  <RadioGroupItem id="join" value="join" />
                  Join
                </Label>
                <Label
                  htmlFor="create"
                  className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-muted"
                >
                  <RadioGroupItem id="create" value="create" />
                  Create
                </Label>
              </RadioGroup>
              <Button>Join or Create</Button>
            </div>
          </div>
        </div>
      </main>
      <div className="bg-muted px-4 lg:px-6 py-6 flex justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <ChromeIcon className="h-5 w-5" />
          Login with Google
        </Button>
      </div>
    </div>
  )
}


