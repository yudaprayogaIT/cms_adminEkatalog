"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function MemberGroupCard({
  id,
  name,
  companyCount,
  profilePic,
  onClick,
}: {
  id?: number;
  name: string;
  companyCount: number;
  profilePic?: string;
  onClick?: () => void;
}) {
  // keep local src so we can fallback on image error
  const placeholder = "/images/avatars/avatarman_placeholder.png";
  const [src, setSrc] = useState<string>(profilePic ?? placeholder);

  // if parent changes profilePic, keep src in sync
  React.useEffect(() => {
    setSrc(profilePic ?? placeholder);
  }, [profilePic]);

  return (
    <div
      data-id={id ?? ""}
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
      className="bg-white rounded-xl shadow px-2 py-4 flex flex-col items-start gap-3 cursor-pointer hover:shadow-lg transition"
    >
      <div className="text-xs px-2 py-1 ml-auto rounded bg-gray-100 text-gray-500">
        {companyCount} {companyCount !== 1 ? "companies" : "company"}
      </div>
      <div className="flex items-center w-full gap-4 my-4">
        <div className="w-30 h-30 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
          {/* Next Image with onError fallback */}
          <Image
            src={src}
            alt={name ?? "avatar"}
            width={400}
            height={400}
            className="object-cover w-full h-full"
            onError={() => {
              // Next/Image provides onError callback; set fallback src
              setSrc(placeholder);
            }}
            unoptimized={false}
          />
        </div>

        <div className="flex-1">
          <div className="text-lg font-medium text-gray-800">{name}</div>
          <div className="text-xs text-gray-500">
            Click to see details
          </div>
        </div>
      </div>
    </div>
  );
}
