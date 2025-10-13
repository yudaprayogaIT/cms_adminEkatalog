// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "products.json");

async function readFileSafe() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function writeFileSafe(data: any) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function GET() {
  const list = await readFileSafe();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const list = await readFileSafe();
    const maxId = list.reduce((m: number, it: any) => Math.max(m, Number(it.id) || 0), 0);
    const next = { id: maxId + 1, ...body };
    list.push(next);
    await writeFileSafe(list);
    return NextResponse.json(next, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as any;
    if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const list = await readFileSafe();
    const idx = list.findIndex((x: any) => Number(x.id) === Number(body.id));
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    list[idx] = { ...list[idx], ...body };
    await writeFileSafe(list);
    return NextResponse.json(list[idx]);
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as any;
    if (!body?.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const list = await readFileSafe();
    const next = list.filter((x: any) => Number(x.id) !== Number(body.id));
    await writeFileSafe(next);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
