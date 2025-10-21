// src/app/memberGroups/page.tsx
"use client";

import MemberGroupsList from "@/components/memberGroups/MemberGroupList";
import React from "react";

export default function Page() {
  return (
    <div className="space-y-6">
      <MemberGroupsList />
    </div>
  );
}
