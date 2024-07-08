import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { LogOut } from "lucide-react"
import { User } from "next-auth"
import { signOut } from "next-auth/react"

type Props = {
  user: User
}

export function UserHover({ user }: Props) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Avatar>
          <AvatarImage src={user.image == null? undefined:user.image} />
          <AvatarFallback>SS</AvatarFallback>
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent className="m-4">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={user.image == null? undefined:user.image} />
            <AvatarFallback>SS</AvatarFallback>
          </Avatar>
          <div className="flex flex-grow flex-col">
            <span className="text-sm font-medium">{user?.github_username}</span>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>
        </div>
        <Button variant="outline" className = "w-full" onClick={() => signOut()}>
          Logout &nbsp; <LogOut />
        </Button>
      </HoverCardContent>
    </HoverCard>
  )
}
