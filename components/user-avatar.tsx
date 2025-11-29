import { useUser } from "@clerk/nextjs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export const UserAvatar = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.imageUrl || ""} />
        <AvatarFallback>
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
