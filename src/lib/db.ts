// File-based JSON database — persists to /tmp/freshers-db + data/ fallback
// In production, replace with PostgreSQL via Prisma (see prisma/schema.prisma)
// This implementation is fully functional end-to-end and mimics relational tables.

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { generatePassCode, generateToken } from "./utils";

type JsonRecord = Record<string, any>;

const DATA_DIR = process.env.NODE_ENV === "production" ? path.join(process.cwd(), "data") : path.join(process.cwd(), "data");
const TMP_DIR = path.join("/tmp", "freshers-db");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(DATA_DIR);
ensureDir(TMP_DIR);

// Use TMP_DIR as primary writable in sandbox, fall back to DATA_DIR
function dbPath(name: string) {
  // Prefer TMP_DIR if exists, else DATA_DIR
  const tmpFile = path.join(TMP_DIR, `${name}.json`);
  const dataFile = path.join(DATA_DIR, `${name}.json`);
  if (fs.existsSync(tmpFile)) return tmpFile;
  if (fs.existsSync(dataFile)) {
    // copy to tmp for writable
    try { fs.copyFileSync(dataFile, tmpFile); return tmpFile; } catch {}
    return dataFile;
  }
  return tmpFile;
}

function readJson<T>(name: string, fallback: T): T {
  const p = dbPath(name);
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.error(`readJson ${name} failed`, e);
  }
  // try DATA_DIR
  const alt = path.join(DATA_DIR, `${name}.json`);
  try {
    if (fs.existsSync(alt)) return JSON.parse(fs.readFileSync(alt, "utf-8"));
  } catch {}
  return fallback;
}

function writeJson(name: string, data: any) {
  const p = path.join(TMP_DIR, `${name}.json`);
  ensureDir(TMP_DIR);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  // also try to write to DATA_DIR for persistence in git (best effort)
  try {
    const alt = path.join(DATA_DIR, `${name}.json`);
    ensureDir(DATA_DIR);
    fs.writeFileSync(alt, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

// ---------- Types ----------
export type PassType = "FRESHER" | "SENIOR";
export type PassStatus = "PAID" | "VERIFIED" | "USED" | "UNUSED" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "CANCELLED";
export type CulturalStatus = "PENDING" | "SHORTLISTED" | "APPROVED" | "REJECTED";
export type EventType = "DANCE" | "DRAMA" | "SINGING";
export type OrganiserRole = "SUPER_ADMIN" | "ORGANISER" | "SCANNER";

export interface PassRecord {
  id: string;
  passCode: string;
  qrToken: string;
  type: PassType;
  name: string;
  registrationNumber: string;
  branch: string;
  yearSemester: string;
  phone: string;
  email: string;
  priceOriginal: number; // paise
  discount: number;
  priceFinal: number;
  couponCode?: string;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: PassStatus;
  used: boolean;
  usedAt?: string;
  usedBy?: string;
  createdAt: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
}

export interface CulturalApplication {
  id: string;
  name: string;
  registrationNumber: string;
  branch: string;
  phone: string;
  email: string;
  eventType: EventType;
  performanceName: string;
  participants: number;
  description: string;
  status: CulturalStatus;
  coordinatorName?: string;
  coordinatorPhone?: string;
  performanceDate?: string;
  performanceTime?: string;
  performanceOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  perUserLimit: number;
  minimumPurchase: number;
  active: boolean;
  usedCount: number;
  createdAt: string;
}

export interface EventSettings {
  eventName: string;
  eventYear: string;
  university: string;
  heroHeading: string;
  heroAccent: string;
  heroSubtitle: string;
  eventDate: string; // ISO or "TBA"
  eventTime: string;
  venue: string;
  passPrice: number; // paise
  eventDescription: string;
  announcement: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  socialLinks: { instagram?: string; youtube?: string; website?: string };
  faq: { q: string; a: string }[];
  heroImage?: string;
  culturalImages: { dance: string; drama: string; singing: string };
  gallery: string[];
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organiser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: OrganiserRole;
  displayName: string;
  idPassCode?: string; // for ID pass
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  passId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: "CREATED" | "PAID" | "FAILED";
  couponCode?: string;
  createdAt: string;
}

export interface QrScan {
  id: string;
  passCode: string;
  qrToken: string;
  scannedAt: string;
  scannedBy: string;
  result: "VALID" | "ALREADY_USED" | "INVALID";
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

// ---------- Defaults ----------
const DEFAULT_EVENT_SETTINGS: EventSettings = {
  eventName: "DIPLOMA ENGINEERING FRESHERS",
  eventYear: "2026",
  university: "USHA MARTIN UNIVERSITY",
  heroHeading: "DIPLOMA ENGINEERING",
  heroAccent: "FRESHERS",
  heroSubtitle: "PASS & CULTURAL EVENTS",
  eventDate: "TBA",
  eventTime: "TBA",
  venue: "USHA MARTIN UNIVERSITY CAMPUS",
  passPrice: 50000, // 500 INR in paise
  eventDescription: "The most premium Freshers celebration for Diploma Engineering — where talent meets celebration.",
  announcement: "Freshers event date will be announced soon.",
  coordinatorName: "Cultural Committee",
  coordinatorPhone: "+91 90000 00000",
  coordinatorEmail: "cultural@umu.ac.in",
  socialLinks: {},
  faq: [
    { q: "Who can join the Freshers event?", a: "All Diploma Engineering students — both Freshers and Seniors — can purchase a pass." },
    { q: "What does the pass include?", a: "Event access + cultural participation eligibility + premium digital pass with QR." },
    { q: "How will I receive my pass?", a: "Instantly after payment. Your digital pass with QR appears on screen and can be retrieved anytime." },
    { q: "Can I participate in cultural events without a pass?", a: "You need to submit a cultural application. Shortlisted participants will be contacted by coordinator." },
    { q: "What if I lose my pass?", a: "Use 'Already Purchased? Retrieve Pass' with your Registration Number and Pass Code." },
  ],
  heroImage: "",
  culturalImages: { dance: "", drama: "", singing: "" },
  gallery: [],
  updatedAt: new Date().toISOString(),
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coupon_freshers50",
    code: "FRESHERS50",
    discountType: "PERCENTAGE",
    discountValue: 50,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 500,
    perUserLimit: 1,
    minimumPurchase: 0,
    active: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coupon_earlybird",
    code: "EARLYBIRD20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 200,
    perUserLimit: 1,
    minimumPurchase: 0,
    active: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  },
];

let initialized = false;

async function initIfNeeded() {
  if (initialized) return;
  initialized = true;

  // Event settings
  const settings = readJson<EventSettings | null>("event_settings", null);
  if (!settings) writeJson("event_settings", DEFAULT_EVENT_SETTINGS);

  // Coupons
  const coupons = readJson<Coupon[] | null>("coupons", null);
  if (!coupons || coupons.length === 0) writeJson("coupons", DEFAULT_COUPONS);

  // Organisers
  const organisers = readJson<Organiser[] | null>("organisers", null);
  if (!organisers || organisers.length === 0) {
    const hash = await bcrypt.hash("admin123", 10);
    const scannerHash = await bcrypt.hash("scanner123", 10);
    const superHash = await bcrypt.hash("superadmin123", 10);
    const defaults: Organiser[] = [
      {
        id: "org_admin",
        username: "organiser",
        email: "organiser@umu.ac.in",
        passwordHash: hash,
        role: "ORGANISER",
        displayName: "Freshers Organiser",
        idPassCode: `ORG-${generateToken(6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      },
      {
        id: "org_super",
        username: "superadmin",
        email: "superadmin@umu.ac.in",
        passwordHash: superHash,
        role: "SUPER_ADMIN",
        displayName: "Super Admin — UMU",
        idPassCode: `SUPER-${generateToken(6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      },
      {
        id: "org_scanner",
        username: "scanner",
        email: "scanner@umu.ac.in",
        passwordHash: scannerHash,
        role: "SCANNER",
        displayName: "Gate Scanner",
        idPassCode: `SCAN-${generateToken(6).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      },
    ];
    writeJson("organisers", defaults);
  }

  // Other collections
  const collections: Record<string, any> = {
    passes: [],
    cultural_applications: [],
    announcements: [
      {
        id: "ann_1",
        title: "Welcome to Freshers 2026",
        content: "Freshers event date will be announced soon. Stay tuned for the grand celebration!",
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    payments: [],
    qr_scans: [],
    audit_logs: [],
    media: [],
  };
  for (const [name, fallback] of Object.entries(collections)) {
    const existing = readJson<any[] | null>(name, null);
    if (existing === null) writeJson(name, fallback);
  }
}

// Ensure init on import (async) — callers should await ensureInit()
export async function ensureInit() {
  await initIfNeeded();
}

// ---------- Generic helpers ----------
function getAll<T>(name: string, fallback: T): T {
  return readJson<T>(name, fallback);
}
function setAll(name: string, data: any) {
  writeJson(name, data);
}

// ---------- Event Settings ----------
export async function getEventSettings(): Promise<EventSettings> {
  await ensureInit();
  return getAll<EventSettings>("event_settings", DEFAULT_EVENT_SETTINGS);
}
export async function updateEventSettings(patch: Partial<EventSettings>): Promise<EventSettings> {
  await ensureInit();
  const current = await getEventSettings();
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  setAll("event_settings", updated);
  await logAudit("UPDATE_SETTINGS", "organiser", JSON.stringify(patch));
  return updated;
}

// ---------- Coupons ----------
export async function getCoupons(): Promise<Coupon[]> {
  await ensureInit();
  return getAll<Coupon[]>("coupons", []);
}
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const coupons = await getCoupons();
  return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()) || null;
}
export async function createCoupon(data: Omit<Coupon, "id" | "usedCount" | "createdAt">): Promise<Coupon> {
  await ensureInit();
  const coupons = await getCoupons();
  const coupon: Coupon = { id: `coupon_${Date.now()}`, usedCount: 0, createdAt: new Date().toISOString(), ...data, code: data.code.toUpperCase() };
  coupons.push(coupon);
  setAll("coupons", coupons);
  return coupon;
}
export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<Coupon | null> {
  const coupons = await getCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  coupons[idx] = { ...coupons[idx], ...patch, code: patch.code ? patch.code.toUpperCase() : coupons[idx].code };
  setAll("coupons", coupons);
  return coupons[idx];
}
export async function deleteCoupon(id: string): Promise<boolean> {
  const coupons = await getCoupons();
  const filtered = coupons.filter((c) => c.id !== id);
  if (filtered.length === coupons.length) return false;
  setAll("coupons", filtered);
  return true;
}
export async function validateCoupon(code: string, originalPrice: number, email?: string): Promise<{ valid: boolean; discount: number; finalPrice: number; coupon?: Coupon; reason?: string }> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { valid: false, discount: 0, finalPrice: originalPrice, reason: "Invalid coupon code" };
  if (!coupon.active) return { valid: false, discount: 0, finalPrice: originalPrice, reason: "Coupon is inactive" };
  if (new Date(coupon.expiryDate) < new Date()) return { valid: false, discount: 0, finalPrice: originalPrice, reason: "Coupon expired" };
  if (coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, finalPrice: originalPrice, reason: "Coupon usage limit reached" };
  if (originalPrice < coupon.minimumPurchase) return { valid: false, discount: 0, finalPrice: originalPrice, reason: `Minimum purchase ₹${coupon.minimumPurchase / 100} required` };

  // per user limit check via payments/coupon_usage would go here — simplified to global check for demo
  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") discount = Math.round((originalPrice * coupon.discountValue) / 100);
  else discount = coupon.discountValue * 100; // fixed in rupees -> paise? assume value is in INR
  // Actually FIXED: discountValue is in rupees, convert
  if (coupon.discountType === "FIXED") discount = coupon.discountValue * 100;
  discount = Math.min(discount, originalPrice);
  const finalPrice = originalPrice - discount;
  return { valid: true, discount, finalPrice, coupon };
}

// ---------- Passes ----------
export async function getPasses(): Promise<PassRecord[]> {
  await ensureInit();
  return getAll<PassRecord[]>("passes", []);
}
export async function getPassByCode(passCode: string): Promise<PassRecord | null> {
  const passes = await getPasses();
  return passes.find((p) => p.passCode === passCode) || null;
}
export async function getPassByQrToken(token: string): Promise<PassRecord | null> {
  const passes = await getPasses();
  return passes.find((p) => p.qrToken === token) || null;
}
export async function getPassByRegAndCode(reg: string, code: string): Promise<PassRecord | null> {
  const passes = await getPasses();
  return passes.find((p) => p.registrationNumber.toLowerCase() === reg.toLowerCase() && p.passCode === code) || null;
}
export async function createPass(data: Omit<PassRecord, "id" | "passCode" | "qrToken" | "createdAt" | "status" | "used" | "paymentStatus"> & { status?: PassStatus; paymentStatus?: PassRecord["paymentStatus"] }): Promise<PassRecord> {
  await ensureInit();
  const passes = await getPasses();
  // ensure unique passCode
  let passCode: string;
  do {
    passCode = generatePassCode();
  } while (passes.some((p) => p.passCode === passCode));
  const qrToken = generateToken(48);
  const now = new Date().toISOString();
  const record: PassRecord = {
    id: `pass_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    passCode,
    qrToken,
    createdAt: now,
    status: data.status || "PAID",
    used: false,
    paymentStatus: data.paymentStatus || "PAID",
    ...data,
  };
  passes.push(record);
  setAll("passes", passes);

  // increment coupon usage
  if (data.couponCode) {
    const coupons = await getCoupons();
    const idx = coupons.findIndex((c) => c.code === data.couponCode);
    if (idx !== -1) {
      coupons[idx].usedCount += 1;
      setAll("coupons", coupons);
    }
  }

  await logAudit("CREATE_PASS", data.email || data.registrationNumber, `Pass ${passCode} for ${data.name}`);
  return record;
}
export async function updatePass(passCode: string, patch: Partial<PassRecord>): Promise<PassRecord | null> {
  const passes = await getPasses();
  const idx = passes.findIndex((p) => p.passCode === passCode);
  if (idx === -1) return null;
  passes[idx] = { ...passes[idx], ...patch };
  setAll("passes", passes);
  return passes[idx];
}
export async function markPassUsed(passCode: string, organiserId: string): Promise<{ success: boolean; reason?: string; pass?: PassRecord }> {
  const pass = await getPassByCode(passCode);
  if (!pass) return { success: false, reason: "Invalid pass" };
  if (pass.used) return { success: false, reason: "PASS_ALREADY_USED", pass };
  if (pass.paymentStatus !== "PAID" && pass.status !== "PAID" && pass.status !== "VERIFIED") return { success: false, reason: "Payment not verified" };
  const updated = await updatePass(passCode, { used: true, status: "USED", usedAt: new Date().toISOString(), usedBy: organiserId });
  // log scan
  const scans = getAll<QrScan[]>("qr_scans", []);
  scans.push({ id: `scan_${Date.now()}`, passCode, qrToken: pass.qrToken, scannedAt: new Date().toISOString(), scannedBy: organiserId, result: "VALID" });
  setAll("qr_scans", scans);
  await logAudit("MARK_USED", organiserId, `Pass ${passCode} marked used`);
  return { success: true, pass: updated! };
}

// ---------- Cultural ----------
export async function getCulturalApplications(): Promise<CulturalApplication[]> {
  await ensureInit();
  return getAll<CulturalApplication[]>("cultural_applications", []);
}
export async function createCulturalApplication(data: Omit<CulturalApplication, "id" | "status" | "createdAt" | "updatedAt">): Promise<CulturalApplication> {
  const apps = await getCulturalApplications();
  const now = new Date().toISOString();
  const app: CulturalApplication = { id: `cult_${Date.now()}`, status: "PENDING", createdAt: now, updatedAt: now, ...data };
  apps.push(app);
  setAll("cultural_applications", apps);
  await logAudit("CULTURAL_APPLY", data.email, `${data.eventType} - ${data.performanceName}`);
  return app;
}
export async function updateCulturalStatus(id: string, patch: Partial<CulturalApplication>): Promise<CulturalApplication | null> {
  const apps = await getCulturalApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  apps[idx] = { ...apps[idx], ...patch, updatedAt: new Date().toISOString() };
  setAll("cultural_applications", apps);
  return apps[idx];
}

// ---------- Announcements ----------
export async function getAnnouncements(publishedOnly = false): Promise<Announcement[]> {
  await ensureInit();
  const anns = getAll<Announcement[]>("announcements", []);
  if (publishedOnly) return anns.filter((a) => a.published);
  return anns;
}
export async function createAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "updatedAt">): Promise<Announcement> {
  const anns = await getAnnouncements();
  const now = new Date().toISOString();
  const ann: Announcement = { id: `ann_${Date.now()}`, createdAt: now, updatedAt: now, ...data };
  anns.push(ann);
  setAll("announcements", anns);
  return ann;
}
export async function updateAnnouncement(id: string, patch: Partial<Announcement>): Promise<Announcement | null> {
  const anns = await getAnnouncements();
  const idx = anns.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  anns[idx] = { ...anns[idx], ...patch, updatedAt: new Date().toISOString() };
  setAll("announcements", anns);
  return anns[idx];
}
export async function deleteAnnouncement(id: string): Promise<boolean> {
  const anns = await getAnnouncements();
  const filtered = anns.filter((a) => a.id !== id);
  if (filtered.length === anns.length) return false;
  setAll("announcements", filtered);
  return true;
}

// ---------- Organisers ----------
export async function getOrganisers(): Promise<Organiser[]> {
  await ensureInit();
  return getAll<Organiser[]>("organisers", []);
}
export async function getOrganiserByUsername(username: string): Promise<Organiser | null> {
  const orgs = await getOrganisers();
  return orgs.find((o) => o.username === username || o.email === username) || null;
}
export async function getOrganiserById(id: string): Promise<Organiser | null> {
  const orgs = await getOrganisers();
  return orgs.find((o) => o.id === id) || null;
}
export async function createOrganiser(data: { username: string; email: string; password: string; role: OrganiserRole; displayName: string }): Promise<Organiser> {
  const orgs = await getOrganisers();
  const hash = await bcrypt.hash(data.password, 10);
  const org: Organiser = {
    id: `org_${Date.now()}`,
    username: data.username,
    email: data.email,
    passwordHash: hash,
    role: data.role,
    displayName: data.displayName,
    idPassCode: `${data.role.slice(0, 4)}-${generateToken(6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  orgs.push(org);
  setAll("organisers", orgs);
  return org;
}

// ---------- Payments ----------
export async function getPayments(): Promise<PaymentRecord[]> {
  await ensureInit();
  return getAll<PaymentRecord[]>("payments", []);
}
export async function createPayment(data: Omit<PaymentRecord, "id" | "createdAt">): Promise<PaymentRecord> {
  const payments = await getPayments();
  const rec: PaymentRecord = { id: `pay_${Date.now()}`, createdAt: new Date().toISOString(), ...data };
  payments.push(rec);
  setAll("payments", payments);
  return rec;
}
export async function updatePayment(id: string, patch: Partial<PaymentRecord>): Promise<PaymentRecord | null> {
  const payments = await getPayments();
  const idx = payments.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  payments[idx] = { ...payments[idx], ...patch };
  setAll("payments", payments);
  return payments[idx];
}

// ---------- QR Scans ----------
export async function getQrScans(): Promise<QrScan[]> {
  await ensureInit();
  return getAll<QrScan[]>("qr_scans", []);
}

// ---------- Audit ----------
export async function logAudit(action: string, actor: string, details: string) {
  const logs = getAll<AuditLog[]>("audit_logs", []);
  logs.push({ id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, action, actor, details, timestamp: new Date().toISOString() });
  // keep last 1000
  if (logs.length > 1000) logs.splice(0, logs.length - 1000);
  setAll("audit_logs", logs);
}
export async function getAuditLogs(): Promise<AuditLog[]> {
  await ensureInit();
  return getAll<AuditLog[]>("audit_logs", []);
}

// ---------- Stats ----------
export async function getDashboardStats() {
  const passes = await getPasses();
  const cultural = await getCulturalApplications();
  const payments = await getPayments();
  const totalPasses = passes.length;
  const paid = passes.filter((p) => p.paymentStatus === "PAID").length;
  const used = passes.filter((p) => p.used).length;
  const unused = paid - used;
  const freshers = passes.filter((p) => p.type === "FRESHER").length;
  const seniors = passes.filter((p) => p.type === "SENIOR").length;
  const revenue = passes.filter((p) => p.paymentStatus === "PAID").reduce((sum, p) => sum + p.priceFinal, 0);
  const discounts = passes.reduce((sum, p) => sum + p.discount, 0);
  const totalCultural = cultural.length;
  return {
    totalPasses,
    paid,
    used,
    unused: Math.max(0, unused),
    revenue,
    discounts,
    freshers,
    seniors,
    totalCultural,
    pendingCultural: cultural.filter((c) => c.status === "PENDING").length,
    recentPasses: passes.slice(-10).reverse(),
    payments,
  };
}
