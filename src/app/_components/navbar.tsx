
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { signOut } from "next-auth/react"
import { User} from "lucide-react"
import { FaHome, FaInfoCircle, FaBoxOpen, FaHistory, FaTachometerAlt } from "react-icons/fa";
import { Plus, Play, Save, Download } from "lucide-react"
import { HiOutlineLogin } from "react-icons/hi";
import { Switch } from "@/components/ui/switch"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Sheet, SheetContent,SheetDescription, SheetTrigger } from "@/app/_components/ui/sheet";
import {  SheetHeader, SheetTitle } from "@/app/_components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ModeToggle } from "@/app/_components/ui/mode-toggle";
import { FaCircleUser } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react"
import { useScrollDirection } from "@/app/_components/other/use-scroll-direction"; // Custom hook to detect scroll direction
import { useTheme } from "next-themes";
import { useEffect, useState } from "react"
import { usePlaySettings } from "@/lib/stores/usePlaySettings";


  

export function Navbar() {
const { autoSave, setAutoSave, showTestPanel, setShowTestPanel } = usePlaySettings();
const pathname = usePathname()
const isPlayPage = pathname === "/play"

  const { data: session } = useSession()
  const role = session?.user.role
  const perms = session?.user.permissions ?? []
  const has = (perm: string) => perms.includes(perm)

const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

 const { theme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check the theme only after the component mounts on the client
    setIsDark(theme === 'dark' || resolvedTheme === 'dark');
  }, [theme, resolvedTheme]);

  //const logoSrc = isDark ? "/t_dark.png" : "/t_light.png";
  const logoSrc = isDark ? "/logo.png" : "/logo.png";

const [open, setOpen] = useState(false);


  const scrollDirection = useScrollDirection();


  return (
  <header
    className={cn(
      "sticky top-0 z-50 w-full border-b bg-white px-4 transition-all duration-300 backdrop-blur-md",
      "bg-gradient-to-r from-gray-150 via-white-150 to-gray-150 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
      "border-gray-700 dark:border-gray-700",
      scrollDirection === "down" && "-translate-y-full",
      scrollDirection === "up" && "translate-y-0",
      scrollDirection === "none" && "translate-y-0"
    )}
  >
    <div className="max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between py-1 px-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
       <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
      <Image
        src={logoSrc}
        alt="FLCLogo"
        width={180}
        height={32}
        priority  
        className="h-10 sm:h-10 md:h-12 w-auto transition-all duration-300"
      />

    </Link>
    {isPlayPage && (
            <div className="hidden lg:flex flex-col justify-center items-start">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Code Whisperer Round 2
              </h1>
              <div className="text-sm text-muted-foreground">
                Visual Function Chaining Challenge
              </div>
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
            Home
          </Link>
          <Link href="/r1" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
            Round_1
          </Link>
            
             {session && role === "TEAM" && (
            <Link href="/play" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Round 2
            </Link>
          )}
         {role === "ADMIN" && (<>
      <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
        Dashboard
      </Link>
           <Link href="/dashboard/leaderboard" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
        Leaderboard
      </Link>

</>
    )}
           
        </nav>

        

        {/* Right Icons */}
        <div className="flex items-center gap-1">
           {isPlayPage && (
            <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTestPanel(!showTestPanel)}>
              <Play className="w-4 h-4 mr-2" />
              Test Functions
            </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 rounded-md shadow-md">
            <Label htmlFor="autosave-switch" className="text-sm text-gray-700 dark:text-gray-200">
              Auto-Save
            </Label>
            <Switch
              id="autosave-switch"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
          </div>
          )}
          <ModeToggle />
          
          {session ? (
            <>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
                    <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

  {/* TEAM Details Sheet */}
  {role === "TEAM" && (
    <Sheet>
      <SheetTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Team Info
        </DropdownMenuItem>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="lg:mt-14 w-full sm:max-w-md lg:max-w-sm rounded-sm bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl p-6"
      >
        <SheetTitle className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-300">
          Team Details
        </SheetTitle>
        <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
          <div><span className="font-medium">Team Name:</span> {session?.user.teamName}</div>
          <div><span className="font-medium">Role:</span> {session?.user.role}</div>
        </div>
      </SheetContent>
    </Sheet>
  )}
  {role === "ADMIN" && (
  <Sheet>
    <SheetTrigger asChild>
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        Admin Info
      </DropdownMenuItem>
    </SheetTrigger>
    <SheetContent
      side="right"
      className="lg:mt-14 w-full sm:max-w-md lg:max-w-sm rounded-sm bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl p-6"
    >
      <SheetTitle className="text-lg font-semibold mb-2 text-teal-700 dark:text-teal-300">
        Admin Details
      </SheetTitle>
      <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
        <div>
          <span className="font-medium">Admin ID:</span> {session?.user.id}
        </div>
        <div>
          <span className="font-medium">Team Name:</span> {session?.user.teamName}
        </div>
        <div>
          <span className="font-medium">Role:</span> {session?.user.role}
        </div>
        <div>
          <span className="font-medium">Permissions:</span>{" "}
          {session?.user.permissions?.join(", ") || "None"}
        </div>
      </div>
    </SheetContent>
  </Sheet>
)}


  {/* Sign Out */}
  <DropdownMenuItem onClick={() => setOpen(false)}>
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        setOpen(false);
        document.cookie = [
          "flash_success=You are signed out successfully.",
          "max-age=5",
          "path=/",
        ].join("; ");
        window.location.href = "/auth/signin";
      }}
      className="w-full text-left"
    >
      Sign Out
    </button>
  </DropdownMenuItem>
</DropdownMenuContent>

              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden lg:inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors
              bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 hover:text-black
              dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <FaCircleUser className="h-5 w-5" />
              Login
            </Link>
          )}

          {/* Theme toggle */}
          

          {/* Mobile Menu */}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <IoMdMenu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="bg-gradient-to-b from-teal-50 to-purple-50 dark:from-teal-900 dark:to-purple-900"
        >
          <SheetHeader>
            
      <SheetTitle>
        <VisuallyHidden>Navigation Menu</VisuallyHidden>
      </SheetTitle>
    </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium">
  <Link href="/" onClick={handleClose} className="flex items-center gap-2 text-lg font-semibold">
      <Image
        src={logoSrc}
        alt="FLC Logo"
        width={180}
        height={32}
        className="h-10 sm:h-10 md:h-12 w-auto transition-all duration-300"
      />
    <span className="sr-only">FLC Packaging</span>
  </Link>

  <Link href="/" onClick={handleClose}  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
    <FaHome className="h-5 w-5" />
    Home
  </Link>
            <Link href="/r1" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
            Round_1
          </Link>
  


  {session ? (
    <>
      {role === "TEAM" && (
            <Link href="/play" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Round 2
            </Link>
          )}
    {role === "ADMIN" && (<>
      <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
        Dashboard
      </Link>
           <Link href="/dashboard/leaderboard" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
        Leaderboard
      </Link>

</>
    )}
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        setOpen(false);
        document.cookie = [
          "flash_success=You are signed out successfully.",
          "max-age=5",
          "path=/",
        ].join("; ");
        window.location.href = "/auth/signin";
      }}
      className="w-full text-left"
    >
      Sign Out
    </button>

  </>
  ) : (
    <Link href="/auth/signin" onClick={handleClose}  className="flex items-center gap-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
      <HiOutlineLogin className="h-5 w-5" />
      Login
    </Link>
  )}
</nav>
        </SheetContent>
      </Sheet>
        </div>
      
      
      </div>
     
    </div>
  </header>
);

}
