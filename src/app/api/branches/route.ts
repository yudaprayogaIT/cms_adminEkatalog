// src/app/api/branches/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'branches.json');

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    return NextResponse.json({ error: 'failed_read' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const list = JSON.parse(raw);
    list.push(body);
    await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return NextResponse.json(body, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'failed_write' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json(); // expect { id, ...fields }
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const list = JSON.parse(raw);
    const idx = list.findIndex((i: any) => i.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    list[idx] = { ...list[idx], ...body };
    await fs.writeFile(DATA_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return NextResponse.json(list[idx]);
  } catch (err) {
    return NextResponse.json({ error: 'failed_update' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json(); // expect { id }
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const list = JSON.parse(raw);
    const next = list.filter((i: any) => i.id !== body.id);
    await fs.writeFile(DATA_PATH, JSON.stringify(next, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'failed_delete' }, { status: 500 });
  }
}
