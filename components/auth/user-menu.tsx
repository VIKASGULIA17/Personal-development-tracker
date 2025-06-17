"use client"

import { LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Pic from '../../public/placeholder-user.jpg'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const userInitials =
    user.user_metadata?.full_name
      ?.split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start px-2">
          <Avatar className="h-8 w-8 mr-2 border-[2px] border-slate-300">
            <AvatarImage
              src={user.user_metadata?.avatar_url || "/profile_pic.jpg"}
              alt={user.user_metadata?.full_name}
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <p className="text-sm font-medium leading-none ">{user.user_metadata?.full_name || "User"}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
       <DropdownMenuItem onClick={() => {
  console.log("Logout menu clicked") // ✅ Debug log
  signOut()
}}>
  <LogOut className="mr-2 h-4 w-4" />
  Log out
</DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
