// src/app/api/members/action/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "public", "data", "members.json");
async function readData() {
  try { const raw = await fs.readFile(DATA_FILE, "utf-8"); return JSON.parse(raw); } catch { return []; }
}
async function writeData(data: any) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    const { action, user_id: userId, admin_id: adminId, reject_reason } = body;
    if (!action || !userId) return new NextResponse("missing action or user_id", { status: 400 });
    const allowed = ["approve", "reject"];
    if (!allowed.includes(action)) return new NextResponse("invalid action", { status: 400 });

    const list = await readData();
    const idx = list.findIndex((x: any) => x.user_id === userId);
    if (idx === -1) return new NextResponse("not found", { status: 404 });

    const now = new Date().toISOString();

    if (action === "approve") {
      list[idx] = {
        ...list[idx],
        member_status: "approved",
        member_since: list[idx].member_since ?? now,
        approved_rejected_date: now,
        approved_rejected_by_admin_id: adminId ?? 1,
        reject_reason: null,
      };
    } else {
      list[idx] = {
        ...list[idx],
        member_status: "rejected",
        approved_rejected_date: now,
        approved_rejected_by_admin_id: adminId ?? 1,
        reject_reason: reject_reason ?? null,
      };
    }

    await writeData(list);
    return NextResponse.json(list[idx]);
  } catch (err) {
    console.error("POST /api/members/action error", err);
    return new NextResponse("internal error", { status: 500 });
  }
}
