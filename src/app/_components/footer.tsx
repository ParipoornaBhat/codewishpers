import Link from "next/link";
import { Separator } from "@/app/_components/ui/seperator";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useSession } from "next-auth/react";

export function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="w-full py-6 bg-gradient-to-r from-purple-600 to-teal-600 text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h3 className="text-xl font-semibold">Finite Loop Club NMAMIT</h3>
<p className="text-sm mt-1">
  Premier coding club at NMAMIT—Realising ideas via hackathons, workshops & peer learning
</p>

        </div>

        <div className="flex space-x-4 mb-4 md:mb-0">
          <Link href="https://www.instagram.com/finiteloop_club_nmamit/" aria-label="Instagram">
            <FaInstagram className="h-6 w-6 hover:text-gray-200" />
          </Link>
          <Link href="https://www.linkedin.com/showcase/finite-loop-club" aria-label="LinkedIn">
            <FaLinkedin className="h-6 w-6 hover:text-gray-200" />
          </Link>
          <Link href="#" aria-label="X / Twitter">
            <FaXTwitter className="h-6 w-6 hover:text-gray-200" />
          </Link>
        </div>

        <nav className="text-center md:text-right">
          <Link href="/" className="mx-2 hover:underline">
            Home
          </Link>
          
          {session && (
            <Link href="/play" className="mx-2 hover:underline">
              Round 2
            </Link>
          )}
        </nav>
      </div>

      <Separator className="my-6 bg-white/30" />

      <div className="text-center text-sm">
        &copy; {new Date().getFullYear()} Finite Loop Club NMAMIT. All rights reserved.
      </div>
    </footer>
  );
}
