"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import useAuthStore from "@/store/auth";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuthStore();

  return (
    <NavigationMenu className="mx-auto max-w-6xl w-screen items-center justify-between px-8 py-2">
      <NavigationMenuList>
        <NavigationMenuItem className="font-bold text-2xl">
          <Link href="/">Chain.io</Link>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuList className="gap-4 flex items-center">
        {!isLoggedIn ? (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink className="cursor-pointer" asChild>
                <Link href="/login">Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </NavigationMenuItem>
          </>
        ) : (
          <NavigationMenuItem>
            <Button variant="link" className="cursor-pointer" onClick={logout}>Logout</Button>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
