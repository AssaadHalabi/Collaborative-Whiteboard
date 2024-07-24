import { Work_Sans } from "next/font/google";

import "../../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

import Room from "./Room";

export const metadata = {
  title: "CollaBoard",
  description:
    "A minimalist Collaborative Whiteboard using fabric.js and Liveblocks for realtime collaboration",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

const RoomLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
    <body className={`${workSans.className}`}>
      {children}
    </body>
  </html>
);

export default RoomLayout;
