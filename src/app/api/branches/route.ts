// src/app/api/branches/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'branches.json');

async function readList() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}
async function writeList(list: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const list = await readList();
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json({ error: 'failed_read' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const list = await readList();
    // pastikan id numeric dan unik
    const maxId = list.reduce((m: number, i: any) => Math.max(m, Number(i.id) || 0), 0);
    const nextId = maxId + 1;
    const item = { id: nextId, ...body };
    list.push(item);
    await writeList(list);
    // kembalikan item yang sudah punya id
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'failed_write' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json(); // expect { id, ...fields }
    const list = await readList();
    const idx = list.findIndex((i: any) => Number(i.id) === Number(body.id));
    if (idx === -1) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    list[idx] = { ...list[idx], ...body };
    await writeList(list);
    return NextResponse.json(list[idx]);
  } catch (err) {
    return NextResponse.json({ error: 'failed_update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json(); // expect { id }
    const list = await readList();
    const next = list.filter((i: any) => Number(i.id) !== Number(body.id));
    await writeList(next);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'failed_delete' }, { status: 500 });
  }
}
