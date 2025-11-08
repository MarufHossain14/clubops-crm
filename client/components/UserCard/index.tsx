import { User } from "@/state/api";
import Image from "next/image";
import React from "react";
import { User as UserIcon } from "lucide-react";

type Props = {
  user: User;
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-lg">
      {user.profilePictureUrl ? (
        <Image
          src={`https://pm-s3-images.s3.us-east-2.amazonaws.com/${user.profilePictureUrl}`}
          alt="profile picture"
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <UserIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
          {user.username || user.fullName || "Unknown User"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {user.email || "No email"}
        </p>
        {user.role && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {user.role}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCard;
