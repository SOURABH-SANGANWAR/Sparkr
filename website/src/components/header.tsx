"use client";

import Link from "next/link";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme_toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { LogOut } from 'lucide-react';
import { UserHover } from "./user_hover";
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react";

const menu = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const { data } = useSession()

  const user = data?.user

  console.log("user:", user)

  const handleLogin = () => {
    window.location.href = '/auth/github/login'
  }

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-10 transition-all border-b duration-300 shadow ${
        isScrolled ? "backdrop-blur-sm" : ""
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
        {/* Title */}
        <Link href="/" className="flex flex-grow items-center gap-2" prefetch={false}>
          <MountainIcon className="h-6 w-6" />
          <h1 className="font-bold">Sparkr</h1>
        </Link>

        {/* PC Navbar */}
        <nav className="hidden items-center gap-6 md:flex">
          {menu.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-gray-50"
              prefetch={false}
            >
              {item.name}
            </Link>
          ))}
          <ModeToggle className="" />
          {user?
            <UserHover user={user} />:
            <Button onClick={handleLogin} >Login</Button>
          }
        </nav>

        {/* Mobile Navbar */}
        <ModeToggle className="mx-2 md:hidden" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="grid gap-4 pt-4">
              
              {/* User details */}
              {user?
                <div className="flex items-center gap-4 dark:bg-gray-700 bg-gray-200 rounded-lg p-2 my-2">
                  <Avatar>
                    <AvatarImage src={user.image == null? undefined:user.image} />
                    <AvatarFallback>SS</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-grow flex-col">
                    <span className="text-sm font-medium">{user?.github_username}</span>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => signOut()}>
                    <LogOut />
                  </Button>
                </div>:
                <Button className = "my-1" onClick={handleLogin}>Login</Button>
              }

              {menu.map((item) => (
                
                <SheetClose asChild 
                key={item.name} >
                  <Link
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-gray-900 dark:hover:text-gray-50"
                    prefetch={false}
                  >
                    {item.name}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function MenuIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MountainIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}



