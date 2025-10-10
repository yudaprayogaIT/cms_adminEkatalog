// src/components/categories/CategoryCard.tsx
"use client";

import React from "react";
import Image from "next/image";

export default function CategoryCard({
  // id,
  name,
  type,
  points,
  image,
  onEdit,
  onDelete,
  onView,
}: {
  id?: number;
  name: string;
  type: string;
  points: number;
  image?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}) {
  return (
    <div
      onClick={() => onView?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onView?.(); }}
      className="bg-white rounded-xl shadow p-4 flex flex-col overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <div className="h-78 bg-gray-50 overflow-hidden rounded-md flex items-center justify-center mb-3">
        {image ? (
          <Image width={1000} height={1000} src={image} alt={name} className="object-cover w-full h-full" />
        ) : (
          <div className="text-xs text-gray-400">No image</div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <div className="text-sm font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{type}</div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-[#B11F23]">{points} pts</div>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="text-xs px-3 py-1 rounded border hover:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="text-xs px-3 py-1 rounded bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
