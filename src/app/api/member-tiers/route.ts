// src/app/api/member-tiers/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
const DATA_FILE = path.join(process.cwd(), "public", "data", "member_tiers.json");

async function readData() { try { const raw = await fs.readFile(DATA_FILE, "utf-8"); return JSON.parse(raw); } catch { return []; } }
async function writeData(data: any) { await fs.mkdir(path.dirname(DATA_FILE), { recursive: true }); await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8"); }

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    const list = await readData();
    const id = Math.max(0, ...list.map((x: any) => x.id ?? 0)) + 1;
    const item = { id, ...body };
    list.push(item);
    await writeData(list);
    return NextResponse.json(item);
  } catch (e) { console.error(e); return new NextResponse("error", { status: 500 }); }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    if (!body.id) return new NextResponse("missing id", { status: 400 });
    const list = await readData();
    const idx = list.findIndex((x: any) => x.id === body.id);
    if (idx === -1) return new NextResponse("not found", { status: 404 });
    list[idx] = { ...list[idx], ...body };
    await writeData(list);
    return NextResponse.json(list[idx]);
  } catch (e) { console.error(e); return new NextResponse("error", { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    if (!body.id) return new NextResponse("missing id", { status: 400 });
    const list = await readData();
    const next = list.filter((x: any) => x.id !== body.id);
    await writeData(next);
    return new NextResponse(null, { status: 204 });
  } catch (e) { console.error(e); return new NextResponse("error", { status: 500 }); }
}
