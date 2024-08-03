import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckIcon } from "./CheckIcon"
import { XIcon } from "./XIcon"
import Link from "next/link";
import Image from "next/image";

export function Pricing() {
  return (
    <>
      <header className="bg-primary-black px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          {/* <ClapperboardIcon className="size-6 text-primary-foreground" />
          <span className="text-primary-foreground font-semibold">CollaBoard</span> */}
          <Image src="/assets/logos.svg" alt="Collaboard Logo" width={140} height={100} />
        </Link>
        <p className="text-primary-foreground text-sm font-medium">Collaborative Whiteboard</p>
      </header>
      <div className="w-full max-w-6xl mx-auto py-12 md:py-20 lg:py-24 px-4 md:px-6">
        <div className="grid gap-8 md:gap-12 lg:gap-16">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Collaborative Whiteboard for Teams</h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Bring your team together with a powerful whiteboard tool.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:g2">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Up to 2 rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Unlimited users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Real-time collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Fully Featured Whiteboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XIcon className="w-5 h-5 text-red-500" />
                    <span>Unlimited rooms</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-black text-white w-full">Sign Up</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Unlimited rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Unlimited users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Real-time collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Fully Featured Whiteboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500" />
                    <span>Unlimited rooms</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-row items-center justify-between">
                <div className="text-4xl font-bold">$9.99</div>
                <div className="text-sm text-muted-foreground">/month</div>
                <Button className="bg-black text-white w-full ml-2">Upgrade</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}


export default Pricing;
