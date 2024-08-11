import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NavbarOuter from "../NavbarOuter";
export function ComingSoon() {
  return (
    <>
      <NavbarOuter />
      <div className='to-primary-foreground flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-primary-grey-200'>
        <div className='max-w-2xl px-4 py-12 text-center sm:px-6 lg:px-8'>
          <h1 className='text-4xl font-bold tracking-tight text-secondary-foreground sm:text-5xl lg:text-6xl'>
            Coming Soon
          </h1>
          <p className='mt-6 text-lg leading-8 text-secondary-foreground'>
            We&apos;re working hard to bring you something amazing. Stay tuned
            for updates!
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <div />
          </div>
          {/* <div className="mt-10 flex justify-center">
          <form className="flex gap-2 w-full max-w-md">
            <Input type="email" placeholder="Enter your email" className="flex-1" />
            <Button type="submit">Notify Me</Button>
          </form>
        </div> */}
        </div>
      </div>
    </>
  );
}

export default ComingSoon;
