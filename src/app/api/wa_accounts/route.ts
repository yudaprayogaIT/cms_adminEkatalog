// src/app/api/wa_accounts/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'wa_accounts.json');
const USERS_PATH = path.join(process.cwd(), 'public', 'data', 'users.json');

async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}
async function writeData(data: any) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

// normalize phone field: accept phone or phone_number
function pickPhone(body: any) {
  if (body?.phone) return body.phone;
  if (body?.phone_number) return body.phone_number;
  return null;
}

export async function GET() {
  const items = await readData();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const items = await readData();
  const users = await readUsers();
  const id = items.length ? Math.max(...items.map((i: any) => i.id)) + 1 : 1;
  const now = new Date().toISOString();

  let phone = pickPhone(body);
  let name = body.name ?? null;
  if (body.user_id) {
    const u = users.find((x: any) => Number(x.id) === Number(body.user_id));
    if (u) {
      if (!phone) phone = u.phone ?? u.phone_number ?? null;
      if (!name) name = u.name ?? name;
    }
  }

  const newItem = {
    id,
    user_id: body.user_id ?? null,
    name: name ?? 'Unnamed',
    phone: phone ?? '',
    session_path: body.session_path ?? null,
    status: body.status ?? 'disconnected',
    disabled: body.disabled ?? 0,
    last_login_at: body.last_login_at ?? null,
    last_seen_at: body.last_seen_at ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    ...body
  };

  items.push(newItem);
  await writeData(items);
  return NextResponse.json(newItem);
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const items = await readData();
  const users = await readUsers();
  const idx = items.findIndex((it: any) => it.id === Number(body.id));
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const old = items[idx];
  const phoneFromBody = pickPhone(body);
  let updated = { ...old, ...body, updated_at: new Date().toISOString() };

  // if user_id present and phone/name not provided, fill from users
  if (body.user_id) {
    const u = users.find((x: any) => Number(x.id) === Number(body.user_id));
    if (u) {
      if (!body.name) updated.name = u.name ?? updated.name;
      if (!phoneFromBody) updated.phone = u.phone ?? u.phone_number ?? updated.phone;
    }
  }

  // if body provides phone/phone_number, prefer that
  if (phoneFromBody) updated.phone = phoneFromBody;

  items[idx] = updated;
  await writeData(items);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body?.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  let items = await readData();
  items = items.filter((it: any) => it.id !== Number(body.id));
  await writeData(items);
  return NextResponse.json({ ok: true });
}
