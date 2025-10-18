// src/app/api/members/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "public", "data", "members.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    // if file missing or invalid, return empty list
    return [];
  }
}

async function writeData(data: any) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    throw e;
  }
}

/**
 * GET /api/members
 * returns all member applications
 */
export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

/**
 * POST /api/members
 * - if body contains user_id that exists -> update that record (upsert)
 * - otherwise insert new record
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    const list = await readData();

    // Basic validation
    if (!body.user_id && !body.user_name) {
      return new NextResponse("missing user_id or user_name", { status: 400 });
    }

    const userId = body.user_id ?? Math.max(0, ...list.map((x: any) => x.user_id ?? 0)) + 1;
    const idx = list.findIndex((x: any) => x.user_id === userId);

    const now = new Date().toISOString();

    const item = {
      ...body,
      user_id: userId,
      application_date: body.application_date ?? body.application_date ?? now,
      // keep member_since if provided, otherwise null
      member_since: body.member_since ?? null,
      approved_rejected_date: body.approved_rejected_date ?? null,
    };

    if (idx === -1) {
      list.push(item);
    } else {
      list[idx] = { ...list[idx], ...item };
    }

    await writeData(list);
    return NextResponse.json(item);
  } catch (err) {
    console.error("POST /api/members error", err);
    return new NextResponse("internal error", { status: 500 });
  }
}

/**
 * DELETE /api/members
 * expects JSON body { user_id }
 */
export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    if (!body.user_id) return new NextResponse("missing user_id", { status: 400 });

    const list = await readData();
    const next = list.filter((x: any) => x.user_id !== body.user_id);
    await writeData(next);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/members error", err);
    return new NextResponse("internal error", { status: 500 });
  }
}
