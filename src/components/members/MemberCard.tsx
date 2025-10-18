"use client";

import React from "react";
import Image from "next/image";

export default function MemberCard({
  id,
  name,
  role,
  cabang,
  phone,
  profilePic,
  status,
  onClick,
}: {
  id?: number;
  name: string;
  role: string;
  cabang?: string;
  phone?: string;
  profilePic?: string;
  status?: string;
  onClick?: () => void;
}) {
  return (
    <div
      data-id={id ?? ""}
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center relative overflow-hidden cursor-pointer"
    >
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
        <Image
          src={profilePic ?? "/images/avatars/avatarman_placeholder.png"}
          alt={name}
          width={500}
          height={500}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="text-lg font-medium text-gray-800">{name}</div>
      <div className="text-sm text-gray-400 mt-1">
        {role} {cabang ? `- ${cabang}` : ""}
      </div>
      <div className="text-sm text-gray-400 mt-2">{phone}</div>

      {status && <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-gray-100">{status}</div>}
    </div>
  );
}
