// src/app/api/members/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "public", "data", "members.json");

/**
 * expected shape:
 * [
 *   {
 *     user_id: number,
 *     user_name: string,
 *     is_phone_verified_otp: boolean,
 *     companies: [
 *       {
 *         company_name: string,
 *         company_address: string,
 *         member_tier: string,
 *         loyalty_points: number|null,
 *         branch_id: number,
 *         branch_name: string,
 *         member_status: string,
 *         member_since: string|null,
 *         last_activity_date: string|null,
 *         application_date: string|null,
 *         approved_rejected_date: string|null,
 *         approved_rejected_by_admin_id: number|null,
 *         reject_reason: string|null
 *       }
 *     ]
 *   }
 * ]
 */

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    // file mungkin belum ada atau invalid => return empty array
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

function nowISO() {
  return new Date().toISOString();
}

/**
 * GET -> return all user records (with companies array)
 */
export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

/**
 * POST -> two modes:
 * 1) action mode: body.action === "approve"|"reject" -> update member_status for a company
 *    body: { action, user_id, branch_id?, admin_id, reject_reason? }
 *
 * 2) upsert mode (no body.action): insert/update a user record.
 *    body: { user_id?, user_name, is_phone_verified_otp?, companies: [...] }
 *    If user_id provided and exists -> merge/replace; otherwise create new user_id.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    const list = await readData();

    // ACTION MODE
    if (body.action) {
      const action = String(body.action);
      if (!["approve", "reject"].includes(action)) {
        return new NextResponse("invalid action", { status: 400 });
      }
      if (!body.user_id) return new NextResponse("missing user_id", { status: 400 });
      const userId = Number(body.user_id);
      const branchId = body.branch_id !== undefined ? Number(body.branch_id) : undefined;
      const adminId = body.admin_id ?? null;
      const rejectReason = body.reject_reason ?? null;

      const idx = list.findIndex((u: any) => Number(u.user_id) === userId);
      if (idx === -1) {
        return new NextResponse("user not found", { status: 404 });
      }

      const userRec = list[idx];

      // find company by branch_id or by company_name fallback
      let companyIdx = -1;
      if (branchId !== undefined) {
        companyIdx = (userRec.companies || []).findIndex((c: any) => Number(c.branch_id) === branchId);
      }
      if (companyIdx === -1 && body.company_name) {
        companyIdx = (userRec.companies || []).findIndex((c: any) => String(c.company_name) === String(body.company_name));
      }
      if (companyIdx === -1) {
        // fallback: use first company (safe fallback)
        companyIdx = 0;
      }

      if (!Array.isArray(userRec.companies) || userRec.companies.length === 0) {
        return new NextResponse("user has no companies", { status: 400 });
      }

      const company = userRec.companies[companyIdx];

      // set status + meta
      if (action === "approve") {
        company.member_status = "approved";
        company.approved_rejected_date = nowISO();
        company.approved_rejected_by_admin_id = adminId;
        company.reject_reason = null;
        // optionally set member_since if not set
        if (!company.member_since) company.member_since = nowISO();
      } else {
        company.member_status = "rejected";
        company.approved_rejected_date = nowISO();
        company.approved_rejected_by_admin_id = adminId;
        company.reject_reason = rejectReason ?? null;
      }

      // write back
      list[idx].companies[companyIdx] = company;
      await writeData(list);
      return NextResponse.json({ ok: true, user_id: userId, branch_id: company.branch_id, company_idx: companyIdx });
    }

    // UPSERT MODE (no action)
    // Basic validation: need user_name or user_id
    if (!body.user_name && !body.user_id) {
      return new NextResponse("missing user_name or user_id", { status: 400 });
    }

    // normalize companies: allow body.companies or body.company (single)
    let companies = Array.isArray(body.companies) ? body.companies : [];
    if (body.company && typeof body.company === "object") {
      companies = [...companies, body.company];
    }

    const userId = body.user_id ?? (Math.max(0, ...list.map((x: any) => Number(x.user_id ?? 0))) + 1);
    const now = nowISO();
    const idxUser = list.findIndex((x: any) => Number(x.user_id) === Number(userId));

    // prepare user record
    const item = {
      user_id: Number(userId),
      user_name: body.user_name ?? body.user_name ?? `User ${userId}`,
      is_phone_verified_otp: !!body.is_phone_verified_otp,
      companies:
        companies.length > 0
          ? companies.map((c: any) => ({
              company_name: c.company_name ?? null,
              company_address: c.company_address ?? null,
              member_tier: c.member_tier ?? "N/A",
              loyalty_points: c.loyalty_points ?? null,
              branch_id: c.branch_id ?? null,
              branch_name: c.branch_name ?? null,
              member_status: c.member_status ?? "pending",
              member_since: c.member_since ?? null,
              last_activity_date: c.last_activity_date ?? null,
              application_date: c.application_date ?? now,
              approved_rejected_date: c.approved_rejected_date ?? null,
              approved_rejected_by_admin_id: c.approved_rejected_by_admin_id ?? null,
              reject_reason: c.reject_reason ?? null,
            }))
          : [
              {
                company_name: body.company_name ?? null,
                company_address: body.company_address ?? null,
                member_tier: body.member_tier ?? "N/A",
                loyalty_points: body.loyalty_points ?? null,
                branch_id: body.branch_id ?? null,
                branch_name: body.branch_name ?? null,
                member_status: body.member_status ?? "pending",
                member_since: body.member_since ?? null,
                last_activity_date: body.last_activity_date ?? null,
                application_date: body.application_date ?? now,
                approved_rejected_date: body.approved_rejected_date ?? null,
                approved_rejected_by_admin_id: body.approved_rejected_by_admin_id ?? null,
                reject_reason: body.reject_reason ?? null,
              },
            ],
    };

    if (idxUser === -1) {
      list.push(item);
    } else {
      // merge: keep existing companies unless new ones provided (we'll merge by branch_id if possible)
      const existing = list[idxUser];
      const existingCompanies = Array.isArray(existing.companies) ? existing.companies : [];

      // if incoming companies provided, merge them
      if (companies.length > 0) {
        companies.forEach((c: any) => {
          const bid = c.branch_id ?? null;
          const found = existingCompanies.findIndex((ec: any) => ec.branch_id !== null && bid !== null && Number(ec.branch_id) === Number(bid));
          if (found >= 0) {
            existingCompanies[found] = { ...existingCompanies[found], ...c };
          } else {
            existingCompanies.push(c);
          }
        });
      }

      // override fields
      list[idxUser] = {
        ...existing,
        user_name: item.user_name ?? existing.user_name,
        is_phone_verified_otp: item.is_phone_verified_otp ?? existing.is_phone_verified_otp,
        companies: existingCompanies.length > 0 ? existingCompanies : item.companies,
      };
    }

    await writeData(list);
    return NextResponse.json(item);
  } catch (err) {
    console.error("POST /api/members error", err);
    return new NextResponse("internal error", { status: 500 });
  }
}

/**
 * DELETE -> body: { user_id, branch_id? }
 * - if branch_id present remove that company from the user's companies array.
 * - if after removal companies empty -> remove user record.
 * - if branch_id not present -> remove whole user record.
 */
export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) ?? {};
    if (!body.user_id) return new NextResponse("missing user_id", { status: 400 });

    const userId = Number(body.user_id);
    const branchId = body.branch_id !== undefined ? Number(body.branch_id) : undefined;

    const list = await readData();
    const idx = list.findIndex((x: any) => Number(x.user_id) === userId);
    if (idx === -1) return new NextResponse("user not found", { status: 404 });

    if (branchId === undefined) {
      // delete entire user
      const next = list.filter((x: any) => Number(x.user_id) !== userId);
      await writeData(next);
      return new NextResponse(null, { status: 204 });
    }

    // delete specific company
    const user = list[idx];
    const companies = Array.isArray(user.companies) ? user.companies.filter((c: any) => Number(c.branch_id) !== branchId) : [];
    if (companies.length === 0) {
      // remove user entirely
      const next = list.filter((x: any) => Number(x.user_id) !== userId);
      await writeData(next);
      return new NextResponse(null, { status: 204 });
    }
    list[idx].companies = companies;
    await writeData(list);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/members error", err);
    return new NextResponse("internal error", { status: 500 });
  }
}
