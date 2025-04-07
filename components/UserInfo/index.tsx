import React from "react";
import { ProfilePicture } from "../ProfilePicture";

interface UserInfoProps {
  user?: string;
  desc?: string;
  pfp: string;
  posts?: number;
  followers?: number;
  followed?: number;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  user,
  desc,
  pfp,
  posts,
  followers,
  followed,
}) => {
  return (
    <div className="flex flex-col bg-accent-foreground h-full border border-border p-3 rounded-3xl">
      <div>
      <ProfilePicture image={pfp} />
      </div>
      <div>
        <span>{user}</span>
      </div>
      <div>
        <span>{desc}</span>
      </div>
    </div>
  );
};
