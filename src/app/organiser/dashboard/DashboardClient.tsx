"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Users,
  QrCode,
  IndianRupee,
  BadgePercent,
  Music,
  LogOut,
  ScanLine,
  Megaphone,
  Image as ImageIcon,
  Settings,
  BarChart3,
  IdCard,
  Calendar,
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Eye,
  Trash2,
  Plus,
  Edit2,
  Save,
} from "lucide-react";

export default function DashboardClient({ user }: { user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "passes" | "cultural" | "coupons" | "scanner" | "announcements" | "images" | "reports" | "settings" | "audit">("overview");
  const [stats, setStats] = useState<any>(null);
  const [passes, setPasses] = useState<any[]>([]);
  const [cultural, setCultural] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newCoupon, setNewCoupon] = useState({ code: "", discountType: "PERCENTAGE", discountValue: 50, expiryDate: "", usageLimit: 100, minimumPurchase: 0 });
  const [newAnn, setNewAnn] = useState({ title: "", content: "" });
  const [editSettings, setEditSettings] = useState<any>(null);
  const [scannerInput, setScannerInput] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState("");
  const [isScanningCamera, setIsScanningCamera] = useState(false);

  const isScannerOnly = user.role === "SCANNER";

  async function fetchAll() {
    setLoading(true);
    try {
      const [sRes, pRes, cRes, coupRes, annRes, setRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/passes"),
        fetch("/api/cultural"),
        fetch("/api/coupons"),
        fetch("/api/announcements"),
        fetch("/api/event-settings"),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (pRes.ok) {
        const data = await pRes.json();
        setPasses(Array.isArray(data) ? data : []);
      }
      if (cRes.ok) {
        const data = await cRes.json();
        setCultural(Array.isArray(data) ? data : []);
      }
      if (coupRes.ok) {
        const d = await coupRes.json();
        setCoupons(Array.isArray(d) ? d : []);
      }
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (setRes.ok) {
        const s = await setRes.json();
        setSettings(s);
        setEditSettings(s);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (isScannerOnly) setActiveTab("scanner");
  }, [isScannerOnly]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/organiser/login");
  }

  async function handleCreateCoupon() {
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newCoupon,
        expiryDate: newCoupon.expiryDate ? new Date(newCoupon.expiryDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
        perUserLimit: 1,
        active: true,
      }),
    });
    if (res.ok) {
      setNewCoupon({ code: "", discountType: "PERCENTAGE", discountValue: 50, expiryDate: "", usageLimit: 100, minimumPurchase: 0 });
      fetchAll();
    } else {
      const d = await res.json();
      alert(d.error || "Failed");
    }
  }

  async function handleCreateAnn() {
    const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newAnn, published: true }) });
    if (res.ok) {
      setNewAnn({ title: "", content: "" });
      fetchAll();
    }
  }

  async function handleUpdateCultural(id: string, patch: any) {
    const res = await fetch(`/api/cultural/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    if (res.ok) fetchAll();
  }

  async function handleSaveSettings() {
    const res = await fetch("/api/event-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editSettings) });
    if (res.ok) {
      alert("Settings saved");
      fetchAll();
    }
  }

  async function handleScan(verifyOnly = true) {
    setScanError("");
    setScanResult(null);
    if (!scannerInput.trim()) return setScanError("Enter Pass Code or QR data");
    try {
      const body: any = {};
      // detect if input is JSON or code
      const trimmed = scannerInput.trim();
      if (trimmed.startsWith("{")) body.qrData = trimmed;
      else if (trimmed.startsWith("F26-")) body.passCode = trimmed;
      else body.qrToken = trimmed;

      const endpoint = "/api/scanner";
      const method = verifyOnly ? "POST" : "PUT";
      const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setScanError(data.error || data.message || "Scan failed");
        if (data.alreadyUsed) setScanResult(data);
        return;
      }
      setScanResult(data);
      if (!verifyOnly && data.success) {
        // marked as used
        fetchAll();
      }
    } catch (e: any) {
      setScanError(e.message);
    }
  }

  // Camera scanner using html5-qrcode dynamically
  async function startCameraScan() {
    setIsScanningCamera(true);
    setScanError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("reader");
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          setScannerInput(decoded);
          html5QrCode.stop().then(() => setIsScanningCamera(false));
          // auto verify
          setTimeout(() => {
            // set input and trigger scan
            fetch("/api/scanner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ qrData: decoded }) })
              .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
              .then(({ ok, d }) => {
                if (!ok) setScanError(d.error || d.message);
                setScanResult(d);
              });
          }, 300);
        },
        () => {}
      );
      // store for stop
      (window as any).__qr = html5QrCode;
    } catch (e: any) {
      setScanError("Camera not available: " + e.message);
      setIsScanningCamera(false);
    }
  }
  function stopCamera() {
    const qr = (window as any).__qr;
    if (qr) qr.stop().then(() => setIsScanningCamera(false)).catch(() => setIsScanningCamera(false));
    else setIsScanningCamera(false);
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3, roles: ["SUPER_ADMIN", "ORGANISER", "SCANNER"] },
    { id: "passes", label: "Passes", icon: Ticket, roles: ["SUPER_ADMIN", "ORGANISER"] },
    { id: "cultural", label: "Cultural", icon: Music, roles: ["SUPER_ADMIN", "ORGANISER"] },
    { id: "scanner", label: "QR Scanner", icon: ScanLine, roles: ["SUPER_ADMIN", "ORGANISER", "SCANNER"] },
    { id: "coupons", label: "Coupons", icon: BadgePercent, roles: ["SUPER_ADMIN", "ORGANISER"] },
    { id: "announcements", label: "Announcements", icon: Megaphone, roles: ["SUPER_ADMIN", "ORGANISER"] },
    { id: "images", label: "Images", icon: ImageIcon, roles: ["SUPER_ADMIN", "ORGANISER"] },
    { id: "reports", label: "Reports", icon: BarChart3, roles: ["SUPER_ADMIN", "ORGANISER"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN", "ORGANISER"] },
  ].filter((t) => t.roles.includes(user.role));

  const filteredPasses = passes.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.registrationNumber.toLowerCase().includes(s) || p.passCode.toLowerCase().includes(s) || p.phone.includes(s);
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#E8E8E8]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-sm font-black text-black">UM</div>
            <div>
              <div className="text-sm font-black tracking-wide text-white">UMU ORGANISER</div>
              <div className="text-xs tracking-wide text-[#C9A227]">FRESHERS 2026 • DASHBOARD</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold text-white">{user.displayName}</div>
              <div className="text-xs text-[#BFC0C2]">{user.role} • {user.idPassCode}</div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-black ${user.role === "SUPER_ADMIN" ? "bg-[#C9A227] text-black" : user.role === "SCANNER" ? "bg-[#1C1C1C] border border-white/10 text-white" : "bg-white text-black"}`}>{user.role}</div>
            <button onClick={handleLogout} className="rounded-full border border-white/10 bg-[#151515] p-2.5 text-white hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 border-b border-white/[0.06] bg-[#080808] p-4 lg:w-[260px] lg:border-b-0 lg:border-r">
          {/* ID Pass Card */}
          <div className="rounded-[20px] border border-[#C9A227]/30 bg-gradient-to-br from-[#0D0D0D] to-[#151515] p-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#C9A227]"><IdCard className="h-4 w-4" /> ORGANISER ID PASS</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A227] to-[#E5C76B] text-sm font-black text-black">
                {user.displayName?.slice(0, 2).toUpperCase() || "OR"}
              </div>
              <div>
                <div className="text-sm font-black text-white">{user.displayName}</div>
                <div className="text-xs text-[#BFC0C2]">{user.email}</div>
                <div className="font-mono text-xs font-bold text-[#E5C76B]">{user.idPassCode}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-xs font-black text-black">{user.role}</div>
            <div className="mt-2 text-xs text-[#BFC0C2]">Show this ID at organising desk. Do not share.</div>
          </div>

          <nav className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === t.id ? "bg-[#C9A227] text-black" : "bg-[#151515] text-[#BFC0C2] hover:bg-[#1C1C1C] hover:text-white border border-white/[0.06]"}`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-xl border border-white/[0.06] bg-[#151515] p-4 lg:block">
            <div className="text-xs font-bold text-white">Quick Stats</div>
            {stats ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#BFC0C2]">Total Passes</span><span className="font-bold text-white">{stats.totalPasses}</span></div>
                <div className="flex justify-between"><span className="text-[#BFC0C2]">Revenue</span><span className="font-bold text-[#C9A227]">₹{Math.round(stats.revenue / 100)}</span></div>
                <div className="flex justify-between"><span className="text-[#BFC0C2]">Cultural Apps</span><span className="font-bold text-white">{stats.totalCultural}</span></div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-[#BFC0C2]">Loading...</div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-[#BFC0C2]">Loading dashboard...</div>
          ) : (
            <>
              {activeTab === "overview" && !isScannerOnly && (
                <div className="space-y-6">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      { label: "TOTAL PASSES", value: stats?.totalPasses ?? 0, icon: Ticket, color: "text-white" },
                      { label: "PAID / VERIFIED", value: stats?.paid ?? 0, icon: CheckCircle2, color: "text-emerald-400" },
                      { label: "USED PASSES", value: stats?.used ?? 0, icon: QrCode, color: "text-[#C9A227]" },
                      { label: "UNUSED PASSES", value: stats?.unused ?? 0, icon: Clock, color: "text-[#BFC0C2]" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-5">
                        <div className="flex items-center justify-between"><s.icon className={`h-5 w-5 ${s.color}`} /><span className="text-2xl font-black text-white">{s.value}</span></div>
                        <div className="mt-3 text-xs font-bold tracking-wide text-[#BFC0C2]">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[
                      { label: "TOTAL REVENUE", value: `₹${Math.round((stats?.revenue || 0) / 100)}`, icon: IndianRupee },
                      { label: "TOTAL DISCOUNTS", value: `₹${Math.round((stats?.discounts || 0) / 100)}`, icon: BadgePercent },
                      { label: "FRESHERS", value: stats?.freshers ?? 0, icon: Users },
                      { label: "SENIORS", value: stats?.seniors ?? 0, icon: Users },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-[#151515] p-5">
                        <div className="flex items-center gap-2 text-[#C9A227]"><s.icon className="h-4 w-4" /> <span className="text-xs font-bold tracking-wide text-[#BFC0C2]">{s.label}</span></div>
                        <div className="mt-2 text-xl font-black text-white">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black tracking-wide text-white">RECENT PASS ACTIVITY</h3>
                      <span className="text-xs text-[#BFC0C2]">Last 10 passes</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      {(stats?.recentPasses || []).length === 0 ? (
                        <div className="rounded-xl bg-[#151515] p-6 text-center text-sm text-[#BFC0C2]">No passes yet. Share Get My Pass link.</div>
                      ) : (
                        stats.recentPasses.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#151515] px-4 py-3">
                            <div>
                              <div className="text-sm font-bold text-white">{p.name} <span className="text-xs font-normal text-[#BFC0C2]">• {p.branch}</span></div>
                              <div className="font-mono text-xs text-[#C9A227]">{p.passCode} • {p.type}</div>
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${p.used ? "bg-amber-500/20 text-amber-300" : p.paymentStatus === "PAID" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white"}`}>
                                {p.used ? "USED" : p.paymentStatus === "PAID" ? "VERIFIED" : p.status}
                              </div>
                              <div className="mt-1 text-xs text-[#BFC0C2]">{new Date(p.createdAt).toLocaleString("en-IN")}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick actions like reference dashboard */}
                  <div>
                    <h3 className="text-sm font-black tracking-wide text-white">QUICK ACTIONS</h3>
                    <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
                      {[
                        { label: "IMAGE MANAGEMENT", desc: "Upload hero & cultural images", icon: ImageIcon, tab: "images" },
                        { label: "COUPON MANAGEMENT", desc: "Create & manage coupons", icon: BadgePercent, tab: "coupons" },
                        { label: "REPORTS & ANALYTICS", desc: "Export CSV reports", icon: BarChart3, tab: "reports" },
                        { label: "CULTURAL EVENTS", desc: "Review applications", icon: Music, tab: "cultural" },
                        { label: "PASS MANAGEMENT", desc: "Search & manage passes", icon: Ticket, tab: "passes" },
                        { label: "SETTINGS", desc: "Event date, venue, price", icon: Settings, tab: "settings" },
                        { label: "QR SCANNER", desc: "Validate entry QR", icon: ScanLine, tab: "scanner" },
                        { label: "ANNOUNCEMENTS", desc: "Publish updates", icon: Megaphone, tab: "announcements" },
                      ].map((a) => (
                        <button key={a.label} onClick={() => setActiveTab(a.tab as any)} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-5 text-left hover:border-[#C9A227]/30 transition">
                          <a.icon className="h-6 w-6 text-[#C9A227]" />
                          <div className="mt-3 text-xs font-black tracking-wide text-white">{a.label}</div>
                          <div className="text-xs text-[#BFC0C2]">{a.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "passes" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-black text-white">PASS MANAGEMENT</h2>
                    <div className="flex gap-2">
                      <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BFC0C2]" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, reg, pass code, phone" className="w-full rounded-xl border border-white/10 bg-[#151515] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40" />
                      </div>
                      <button onClick={() => {
                        const csv = [["Name","Reg","Branch","Type","PassCode","Phone","Email","Price","Discount","Used","Date"].join(",")].concat(filteredPasses.map((p:any)=> [p.name,p.registrationNumber,p.branch,p.type,p.passCode,p.phone,p.email,Math.round(p.priceFinal/100),Math.round(p.discount/100),p.used,p.createdAt].map(v=> `"${String(v).replace(/"/g,'""')}"`).join(","))).join("\n");
                        const blob = new Blob([csv], {type:"text/csv"});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href=url; a.download="passes.csv"; a.click();
                      }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151515] px-4 py-2.5 text-sm font-bold text-white hover:bg-white/5">
                        <Download className="h-4 w-4" /> CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-auto rounded-2xl border border-white/[0.06] bg-[#0D0D0D]">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead className="border-b border-white/[0.06] bg-[#151515] text-xs tracking-wide text-[#BFC0C2]">
                        <tr><th className="px-4 py-3 text-left">NAME</th><th className="px-4 py-3 text-left">REG NO.</th><th className="px-4 py-3">BRANCH</th><th className="px-4 py-3">TYPE</th><th className="px-4 py-3">PASS CODE</th><th className="px-4 py-3">PAYMENT</th><th className="px-4 py-3">COUPON</th><th className="px-4 py-3">STATUS</th><th className="px-4 py-3">USED</th><th className="px-4 py-3">DATE</th></tr>
                      </thead>
                      <tbody>
                        {filteredPasses.map((p:any)=> (
                          <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-bold text-white">{p.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-[#E5C76B]">{p.registrationNumber}</td>
                            <td className="px-4 py-3 text-center text-[#BFC0C2]">{p.branch}</td>
                            <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-1 text-xs font-black ${p.type==="FRESHER"?"bg-white text-black":"bg-[#C9A227] text-black"}`}>{p.type}</span></td>
                            <td className="px-4 py-3 font-mono text-xs font-bold text-white">{p.passCode}</td>
                            <td className="px-4 py-3 text-center">₹{Math.round(p.priceFinal/100)}</td>
                            <td className="px-4 py-3 text-center text-[#C9A227]">{p.couponCode || "—"}</td>
                            <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-1 text-xs font-bold ${p.paymentStatus==="PAID"?"bg-emerald-500/20 text-emerald-300":"bg-red-500/20 text-red-300"}`}>{p.paymentStatus}</span></td>
                            <td className="px-4 py-3 text-center">{p.used ? <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-300">USED</span> : <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold">UNUSED</span>}</td>
                            <td className="px-4 py-3 text-xs text-[#BFC0C2]">{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredPasses.length===0 && <div className="p-8 text-center text-sm text-[#BFC0C2]">No passes found.</div>}
                  </div>
                </div>
              )}

              {activeTab === "cultural" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-white">CULTURAL PARTICIPATIONS — DANCE / DRAMA / SINGING</h2>
                  <div className="overflow-auto rounded-2xl border border-white/[0.06] bg-[#0D0D0D]">
                    <table className="w-full min-w-[1000px] text-sm">
                      <thead className="border-b border-white/[0.06] bg-[#151515] text-xs text-[#BFC0C2]">
                        <tr><th className="px-3 py-3 text-left">NAME</th><th className="px-3 py-3">REG</th><th className="px-3">BRANCH</th><th className="px-3">EVENT</th><th className="px-3">PERFORMANCE</th><th className="px-3">PARTICIPANTS</th><th className="px-3">PHONE</th><th className="px-3">STATUS</th><th className="px-3">ACTIONS</th></tr>
                      </thead>
                      <tbody>
                        {cultural.map((a:any)=> (
                          <tr key={a.id} className="border-b border-white/[0.04]">
                            <td className="px-3 py-3 font-bold text-white">{a.name}</td>
                            <td className="px-3 py-3 font-mono text-xs text-[#E5C76B]">{a.registrationNumber}</td>
                            <td className="px-3 py-3 text-[#BFC0C2]">{a.branch}</td>
                            <td className="px-3 py-3"><span className="rounded-full bg-[#C9A227] px-2 py-1 text-xs font-black text-black">{a.eventType}</span></td>
                            <td className="px-3 py-3 text-white">{a.performanceName}</td>
                            <td className="px-3 py-3 text-center">{a.participants}</td>
                            <td className="px-3 py-3 text-xs">{a.phone}</td>
                            <td className="px-3 py-3">
                              <select value={a.status} onChange={(e)=> handleUpdateCultural(a.id, {status: e.target.value})} className="rounded-lg border border-white/10 bg-[#151515] px-2 py-1 text-xs font-bold text-white">
                                <option>PENDING</option><option>SHORTLISTED</option><option>APPROVED</option><option>REJECTED</option>
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <button onClick={()=>{
                                const name = prompt("Coordinator Name", a.coordinatorName || "");
                                if(name===null) return;
                                const phone = prompt("Coordinator Phone", a.coordinatorPhone || "");
                                const date = prompt("Performance Date (e.g. 25 Oct 2026)", a.performanceDate || "");
                                const time = prompt("Performance Time", a.performanceTime || "");
                                handleUpdateCultural(a.id, {coordinatorName: name||undefined, coordinatorPhone: phone||undefined, performanceDate: date||undefined, performanceTime: time||undefined});
                              }} className="rounded-lg bg-[#1C1C1C] px-3 py-1 text-xs font-bold text-white border border-white/10">Assign</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {cultural.length===0 && <div className="p-8 text-center text-sm text-[#BFC0C2]">No cultural applications yet.</div>}
                  </div>
                </div>
              )}

              {activeTab === "scanner" && (
                <div className="mx-auto max-w-[720px] space-y-6">
                  <div className="rounded-[24px] border border-white/[0.08] bg-[#0D0D0D] p-6">
                    <h2 className="flex items-center gap-2 text-xl font-black text-white"><QrCode className="h-6 w-6 text-[#C9A227]" /> QR SCANNER</h2>
                    <p className="mt-1 text-sm text-[#BFC0C2]">Scan QR via camera or paste Pass Code / QR token. Backend validates securely.</p>

                    <div className="mt-6 space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input value={scannerInput} onChange={(e)=>setScannerInput(e.target.value)} placeholder="Paste F26-XXXX-XXXX or QR token / scan result" className="flex-1 rounded-xl border border-white/10 bg-[#151515] px-4 py-3 font-mono text-sm text-white" />
                        <button onClick={() => handleScan(true)} className="rounded-xl bg-[#1C1C1C] border border-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/5">VALIDATE</button>
                      </div>

                      <div className="flex gap-2">
                        {!isScanningCamera ? (
                          <button onClick={startCameraScan} className="btn-gold rounded-full px-6 py-3 text-sm font-black"><span>START CAMERA SCAN</span></button>
                        ) : (
                          <button onClick={stopCamera} className="rounded-full border border-red-500/30 bg-red-500/15 px-6 py-3 text-sm font-bold text-red-300">STOP CAMERA</button>
                        )}
                        <button onClick={()=>{setScannerInput(""); setScanResult(null); setScanError("");}} className="rounded-full border border-white/10 bg-[#151515] px-6 py-3 text-sm font-bold text-white">CLEAR</button>
                      </div>

                      <div id="reader" className={`${isScanningCamera?"block":"hidden"} overflow-hidden rounded-2xl border border-white/10 bg-black`} />

                      {scanError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{scanError}</div>}

                      {scanResult && (
                        <div className={`rounded-2xl border p-6 ${scanResult.valid ? "border-emerald-500/30 bg-emerald-500/10" : scanResult.alreadyUsed ? "border-amber-500/30 bg-amber-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                          <div className={`text-lg font-black ${scanResult.valid ? "text-emerald-300" : scanResult.alreadyUsed ? "text-amber-300" : "text-red-300"}`}>{scanResult.message || (scanResult.valid ? "✓ VALID PASS" : "✗ INVALID")}</div>
                          {scanResult.pass && (
                            <div className="mt-4 space-y-2 rounded-xl bg-black/30 p-4 text-sm">
                              <div><span className="text-[#BFC0C2]">Name:</span> <span className="font-bold text-white">{scanResult.pass.name}</span></div>
                              <div><span className="text-[#BFC0C2]">Branch:</span> {scanResult.pass.branch}</div>
                              <div><span className="text-[#BFC0C2]">Reg:</span> <span className="font-mono font-bold text-[#E5C76B]">{scanResult.pass.registrationNumber}</span></div>
                              <div><span className="text-[#BFC0C2]">Pass Code:</span> <span className="font-mono font-bold text-white">{scanResult.pass.passCode}</span></div>
                              <div><span className="text-[#BFC0C2]">Type:</span> {scanResult.pass.type}</div>
                              {scanResult.pass.usedAt && <div><span className="text-[#BFC0C2]">Used At:</span> {new Date(scanResult.pass.usedAt).toLocaleString()}</div>}
                              {scanResult.eventDate && <div><span className="text-[#BFC0C2]">Event Date:</span> {scanResult.eventDate}</div>}
                            </div>
                          )}
                          {scanResult.valid && scanResult.action==="MARK_AS_USED" && (
                            <button onClick={()=>handleScan(false)} className="mt-4 w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-black hover:bg-emerald-400">MARK AS USED</button>
                          )}
                          {scanResult.alreadyUsed && <div className="mt-3 text-sm font-bold text-amber-300">⚠ PASS ALREADY USED — do not allow re-entry.</div>}
                        </div>
                      )}

                      <div className="rounded-xl border border-white/[0.06] bg-[#151515] p-4 text-xs leading-relaxed text-[#BFC0C2]">
                        <div className="font-bold text-white">How it works</div>
                        <div>QR contains secure random token (not raw student data). Scanner sends token to backend for validation. Backend checks pass existence, payment status and used flag. If valid, organiser clicks MARK AS USED which stores timestamp, organiser id and prevents reuse.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "coupons" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">COUPON MANAGEMENT</h2>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
                    <h3 className="text-sm font-bold text-white">Create Coupon</h3>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input placeholder="CODE e.g. FRESHERS50" value={newCoupon.code} onChange={(e)=>setNewCoupon({...newCoupon, code:e.target.value.toUpperCase()})} className="rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm font-mono font-bold text-white" />
                      <select value={newCoupon.discountType} onChange={(e)=>setNewCoupon({...newCoupon, discountType:e.target.value})} className="rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed Amount (₹)</option></select>
                      <input type="number" placeholder="Discount Value" value={newCoupon.discountValue} onChange={(e)=>setNewCoupon({...newCoupon, discountValue:Number(e.target.value)})} className="rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                      <input type="date" value={newCoupon.expiryDate} onChange={(e)=>setNewCoupon({...newCoupon, expiryDate:e.target.value})} className="rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                      <input type="number" placeholder="Usage Limit" value={newCoupon.usageLimit} onChange={(e)=>setNewCoupon({...newCoupon, usageLimit:Number(e.target.value)})} className="rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                      <input type="number" placeholder="Min Purchase (₹)" value={newCoupon.minimumPurchase} onChange={(e)=>setNewCoupon({...newCoupon, minimumPurchase:Number(e.target.value)})} className="rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                    </div>
                    <button onClick={handleCreateCoupon} className="btn-gold mt-4 rounded-full px-6 py-3 text-sm font-black"><span>CREATE COUPON</span></button>
                  </div>

                  <div className="overflow-auto rounded-2xl border border-white/[0.06] bg-[#0D0D0D]">
                    <table className="w-full min-w-[800px] text-sm">
                      <thead className="border-b border-white/[0.06] bg-[#151515] text-xs text-[#BFC0C2]"><tr><th className="px-4 py-3 text-left">CODE</th><th className="px-4 py-3">TYPE</th><th className="px-4 py-3">VALUE</th><th className="px-4 py-3">EXPIRY</th><th className="px-4 py-3">USED</th><th className="px-4 py-3">ACTIVE</th><th className="px-4 py-3">ACTIONS</th></tr></thead>
                      <tbody>
                        {coupons.map((c:any)=>(
                          <tr key={c.id} className="border-b border-white/[0.04]">
                            <td className="px-4 py-3 font-mono font-bold text-[#E5C76B]">{c.code}</td>
                            <td className="px-4 py-3 text-center">{c.discountType}</td>
                            <td className="px-4 py-3 text-center font-bold text-white">{c.discountValue}{c.discountType==="PERCENTAGE"?"%": " ₹"}</td>
                            <td className="px-4 py-3 text-xs text-[#BFC0C2]">{new Date(c.expiryDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-center">{c.usedCount}/{c.usageLimit}</td>
                            <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-1 text-xs font-bold ${c.active?"bg-emerald-500/20 text-emerald-300":"bg-red-500/20 text-red-300"}`}>{c.active?"ACTIVE":"INACTIVE"}</span></td>
                            <td className="px-4 py-3 flex gap-1 justify-center">
                              <button onClick={async()=>{ const n = prompt("Toggle active? (true/false)", String(c.active)); if(n===null) return; await fetch(`/api/coupons/${c.id}`,{method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({active: n==="true"})}); fetchAll();}} className="rounded-lg bg-[#1C1C1C] px-3 py-1 text-xs font-bold border border-white/10">Toggle</button>
                              <button onClick={async()=>{ if(!confirm("Delete coupon?")) return; await fetch(`/api/coupons/${c.id}`,{method:"DELETE"}); fetchAll();}} className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "announcements" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">ANNOUNCEMENTS</h2>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
                    <h3 className="text-sm font-bold text-white">Create Announcement</h3>
                    <input placeholder="Title" value={newAnn.title} onChange={(e)=>setNewAnn({...newAnn, title:e.target.value})} className="mt-3 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                    <textarea placeholder="Content" value={newAnn.content} onChange={(e)=>setNewAnn({...newAnn, content:e.target.value})} rows={3} className="mt-3 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                    <button onClick={handleCreateAnn} className="btn-gold mt-4 rounded-full px-6 py-3 text-sm font-black"><span>PUBLISH</span></button>
                  </div>
                  <div className="space-y-3">
                    {announcements.map((a:any)=>(
                      <div key={a.id} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-5">
                        <div className="flex items-center gap-2 text-xs text-[#BFC0C2]"><Calendar className="h-4 w-4"/>{new Date(a.createdAt).toLocaleString()} <span className={`ml-auto rounded-full px-2 py-1 text-xs font-bold ${a.published?"bg-emerald-500/20 text-emerald-300":"bg-white/10 text-white"}`}>{a.published?"PUBLISHED":"DRAFT"}</span></div>
                        <div className="mt-2 text-sm font-bold text-white">{a.title}</div>
                        <div className="text-sm text-[#BFC0C2]">{a.content}</div>
                        <div className="mt-3 flex gap-2">
                          <button onClick={async()=>{ await fetch(`/api/announcements/${a.id}`,{method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({published: !a.published})}); fetchAll();}} className="rounded-lg bg-[#1C1C1C] border border-white/10 px-3 py-1 text-xs font-bold">Toggle Publish</button>
                          <button onClick={async()=>{ if(!confirm("Delete?"))return; await fetch(`/api/announcements/${a.id}`,{method:"DELETE"}); fetchAll();}} className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "images" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">IMAGE MANAGEMENT</h2>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6">
                    <p className="text-sm text-[#BFC0C2]">Images are managed via Event Settings (hero + cultural). Upload to cloud/object storage in production. For demo, paste image URLs.</p>
                    <div className="mt-4 space-y-3">
                      <div><label className="text-xs font-bold text-[#BFC0C2]">Hero Image URL</label><input value={editSettings?.heroImage || ""} onChange={(e)=>setEditSettings({...editSettings, heroImage:e.target.value})} placeholder="https://..." className="mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" /></div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div><label className="text-xs font-bold text-[#BFC0C2]">Dance Image URL</label><input value={editSettings?.culturalImages?.dance || ""} onChange={(e)=>setEditSettings({...editSettings, culturalImages:{...editSettings.culturalImages, dance:e.target.value}})} placeholder="https://..." className="mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" /></div>
                        <div><label className="text-xs font-bold text-[#BFC0C2]">Drama Image URL</label><input value={editSettings?.culturalImages?.drama || ""} onChange={(e)=>setEditSettings({...editSettings, culturalImages:{...editSettings.culturalImages, drama:e.target.value}})} placeholder="https://..." className="mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" /></div>
                        <div><label className="text-xs font-bold text-[#BFC0C2]">Singing Image URL</label><input value={editSettings?.culturalImages?.singing || ""} onChange={(e)=>setEditSettings({...editSettings, culturalImages:{...editSettings.culturalImages, singing:e.target.value}})} placeholder="https://..." className="mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" /></div>
                      </div>
                      <button onClick={handleSaveSettings} className="btn-gold rounded-full px-6 py-3 text-sm font-black"><span>SAVE IMAGES</span></button>
                    </div>
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#151515] p-4 text-xs text-[#BFC0C2]">
                      <div className="font-bold text-white">Production note</div>
                      <div>Configure Cloudflare R2 / S3 bucket and set R2 env vars. Images should be uploaded via /api/media (multipart) and stored in cloud storage. Admin should not edit code.</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">REPORTS & ANALYTICS</h2>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {[
                      {label:"Total Passes", value:stats?.totalPasses},
                      {label:"Paid Passes", value:stats?.paid},
                      {label:"Used Passes", value:stats?.used},
                      {label:"Unused Passes", value:stats?.unused},
                      {label:"Revenue (₹)", value:Math.round((stats?.revenue||0)/100)},
                      {label:"Discounts (₹)", value:Math.round((stats?.discounts||0)/100)},
                      {label:"Fresher/Senior", value:`${stats?.freshers}/${stats?.seniors}`},
                      {label:"Cultural Apps", value:stats?.totalCultural},
                      {label:"Pending Cultural", value:stats?.pendingCultural},
                    ].map((r)=>(
                      <div key={r.label} className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-5 text-center">
                        <div className="text-xs font-bold tracking-wide text-[#BFC0C2]">{r.label}</div>
                        <div className="mt-2 text-2xl font-black text-[#C9A227]">{String(r.value)}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{
                    const data = {
                      stats,
                      passes,
                      cultural,
                      coupons,
                      generatedAt: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
                    const url = URL.createObjectURL(blob);
                    const a=document.createElement("a"); a.href=url; a.download="reports.json"; a.click();
                  }} className="rounded-full border border-white/10 bg-[#151515] px-6 py-3 text-sm font-bold text-white">EXPORT JSON</button>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-white">EVENT CONTENT MANAGEMENT</h2>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0D0D0D] p-6 space-y-4">
                    {[
                      {key:"eventName", label:"Event Name"},
                      {key:"eventYear", label:"Event Year"},
                      {key:"university", label:"University"},
                      {key:"heroHeading", label:"Hero Heading"},
                      {key:"heroAccent", label:"Hero Accent"},
                      {key:"heroSubtitle", label:"Hero Subtitle"},
                      {key:"eventDate", label:"Event Date (YYYY-MM-DD or TBA)"},
                      {key:"eventTime", label:"Event Time"},
                      {key:"venue", label:"Venue"},
                      {key:"passPrice", label:"Pass Price (paise, e.g. 50000 = ₹500)"},
                      {key:"eventDescription", label:"Event Description"},
                      {key:"coordinatorName", label:"Coordinator Name"},
                      {key:"coordinatorPhone", label:"Coordinator Phone"},
                      {key:"coordinatorEmail", label:"Coordinator Email"},
                    ].map((f)=>(
                      <div key={f.key}>
                        <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">{f.label}</label>
                        <input
                          value={editSettings?.[f.key] ?? ""}
                          onChange={(e)=>setEditSettings({...editSettings, [f.key]: f.key==="passPrice" ? Number(e.target.value) : e.target.value})}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-bold tracking-wide text-[#BFC0C2]">Announcement (hero)</label>
                      <input value={editSettings?.announcement || ""} onChange={(e)=>setEditSettings({...editSettings, announcement:e.target.value})} className="mt-1 w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white" />
                    </div>
                    <button onClick={handleSaveSettings} className="btn-gold rounded-full px-6 py-3 text-sm font-black"><span>SAVE SETTINGS</span></button>
                    <div className="rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 p-4 text-xs text-[#E5C76B]">All changes update the public website instantly. Date TBA shows “DATE TO BE ANNOUNCED SOON”; after entering a real date, website shows formatted date and countdown can appear.</div>
                  </div>
                </div>
              )}

            </>
          )}
        </main>
      </div>
    </div>
  );
}
