"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Menu, X, Search, Building2,
  FlaskConical, ChevronDown, LayoutDashboard,
  Calendar, LogOut, User, Sparkles, Store, Stethoscope, Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useUserRole, dashboardPathForRole } from "@/hooks/useUserRole"

const roleLabel: Record<string, string> = {
  patient:      "Patient",
  clinic_owner: "Clinic Owner",
  clinic_staff: "Clinic Staff",
  lab_owner:    "Lab Owner",
  lab_staff:    "Lab Staff",
  pharmacy_owner: "Pharmacy Owner",
  pharmacy_staff: "Pharmacy Staff",
  doctor:       "Doctor",
  superadmin:   "Admin",
}

const roleDashboardLabel: Record<string, string> = {
  patient:      "My Appointments",
  clinic_owner: "Clinic Dashboard",
  clinic_staff: "Clinic Dashboard",
  lab_owner:    "Lab Dashboard",
  lab_staff:    "Lab Dashboard",
  pharmacy_owner: "Pharmacy Dashboard",
  pharmacy_staff: "Pharmacy Dashboard",
  doctor:       "Doctor Dashboard",
  superadmin:   "Admin Panel",
}

const roleDashboardIcon: Record<string, any> = {
  patient:      Calendar,
  clinic_owner: LayoutDashboard,
  clinic_staff: LayoutDashboard,
  lab_owner:    FlaskConical,
  lab_staff:    FlaskConical,
  pharmacy_owner: Store,
  pharmacy_staff: Store,
  doctor:       Stethoscope,
  superadmin:   LayoutDashboard,
}

function ForProvidersMenu({ effectiveRoles }: { effectiveRoles: string[] }) {
  const [open, setOpen] = useState(false)

  const items = [
    { role: "clinic_owner", registerHref: "/clinic/register",   dashHref: "/clinic/dashboard",   registerLabel: "Register My Clinic",  dashLabel: "Go to My Clinic",   icon: Building2,    color: "teal" },
    { role: "doctor",       registerHref: "/doctor/register",   dashHref: "/doctor/dashboard",   registerLabel: "Register as Doctor",  dashLabel: "Go to Doctor Dashboard", icon: Stethoscope, color: "violet" },
    { role: "lab_owner",    registerHref: "/lab/register",      dashHref: "/lab/dashboard",      registerLabel: "Register My Lab",     dashLabel: "Go to My Lab",      icon: FlaskConical, color: "blue" },
    { role: "pharmacy_owner", registerHref: "/pharmacy/register", dashHref: "/pharmacy/dashboard", registerLabel: "Register My Pharmacy", dashLabel: "Go to My Pharmacy", icon: Store,       color: "green" },
  ] as const

  const colorClasses: Record<string, { hover: string; icon: string }> = {
    teal:   { hover: "hover:bg-teal-50 hover:text-teal-700",     icon: "text-teal-500" },
    violet: { hover: "hover:bg-violet-50 hover:text-violet-700", icon: "text-violet-500" },
    blue:   { hover: "hover:bg-blue-50 hover:text-blue-700",     icon: "text-blue-500" },
    green:  { hover: "hover:bg-green-50 hover:text-green-700",   icon: "text-green-500" },
  }

  const allOwned = items.every(i => effectiveRoles.includes(i.role))

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-colors"
      >
        For Providers{" "}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 w-80 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_15px_40px_-10px_rgba(15,23,42,0.12),0_4px_12px_rgba(0,0,0,0.03)] p-2.5 flex flex-col gap-1">
            <p className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {allOwned ? "Your Setups" : "Register"}
            </p>
            {items.map(({ role, registerHref, dashHref, registerLabel, dashLabel, icon: Icon, color }) => {
              const owned = effectiveRoles.includes(role)
              const c = colorClasses[color]
              return (
                <Link key={role} href={owned ? dashHref : registerHref} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 text-sm font-semibold text-slate-700 rounded-xl transition-colors ${c.hover}`}>
                  <Icon className={`w-4.5 h-4.5 ${c.icon} shrink-0`} /> {owned ? dashLabel : registerLabel}
                </Link>
              )
            })}
            <div className="border-t border-slate-100 my-1.5" />
            <Link href="/why" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 text-sm font-medium text-slate-650 hover:bg-slate-50 rounded-xl transition-colors">
              <Building2 className="w-4.5 h-4.5 text-slate-400 shrink-0" /> Why Xyncure?
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NavbarContent() {
  const pathname   = usePathname()
  const router     = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab")
  const [menuOpen, setMenuOpen]         = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const openLogin = (role?: "patient" | "clinic_owner" | "lab_owner") => {
    let url = "/login"
    const params = new URLSearchParams()
    if (pathname && pathname !== "/login") {
      params.set("redirect", pathname + window.location.search)
    }
    if (role) {
      params.set("role", role)
    }
    const query = params.toString()
    if (query) {
      url += `?${query}`
    }
    router.push(url)
    setMenuOpen(false)
  }

  const { authUser, loading } = useUserRole()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const handleSignOut = () => {
    setShowSignOutConfirm(true)
  }

  const confirmSignOut = async () => {
    await signOut(auth)
    setDropdownOpen(false)
    setShowSignOutConfirm(false)
    router.push("/")
  }

  const dashboardPath = authUser ? dashboardPathForRole(authUser.role) : "/"
  const DashboardIcon = authUser?.role ? roleDashboardIcon[authUser.role] ?? Calendar : Calendar
  const dashboardLabel = authUser?.role ? roleDashboardLabel[authUser.role] ?? "Dashboard" : "Dashboard"
  const displayName = authUser?.name ?? authUser?.phone ?? "User"
  const initial = displayName[0]?.toUpperCase() ?? "U"

  // Effective roles = merge roles[] with primary role so UI never breaks if they diverge
  const effectiveRoles = authUser
    ? Array.from(new Set([...(authUser.roles ?? []), authUser.role ?? "patient"].filter(Boolean)))
    : []

  const isHome = pathname === "/"

  return (
    <>
      <nav className={cn(
        "transition-all duration-300 z-50",
        menuOpen 
          ? "max-w-6xl mx-auto bg-gradient-to-b from-white/95 to-teal-50/95 backdrop-blur-md border border-teal-500/20 rounded-3xl mt-4 px-2 shadow-2xl sticky top-4"
          : "max-w-6xl mx-auto bg-gradient-to-r from-white/70 via-teal-50/30 to-white/70 backdrop-blur-md border border-teal-500/15 rounded-full mt-4 px-2 shadow-[0_10px_35px_-8px_rgba(13,148,136,0.12),0_4px_12px_rgba(0,0,0,0.03)] sticky top-4"
      )}>
        <div className="mx-auto px-4 transition-all duration-300">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              className="flex items-center gap-2 shrink-0"
            >
              <img src="/logo.png" alt="XYNCURE Logo" className="w-9 h-9 object-contain" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                XYN<span className="text-teal-600">CURE</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/search" className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/search") ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50")}>
                Find Doctors
              </Link>
              <Link href="/clinics" className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/clinics") ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50")}>
                Clinics
              </Link>
              <Link href="/labs" className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === "/labs" && activeTab !== "tests" ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50")}>
                Labs
              </Link>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 text-slate-600 hover:text-teal-600 hover:bg-slate-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                AI Assistant
              </button>
              <ForProvidersMenu effectiveRoles={effectiveRoles} />
            </div>

            {/* Desktop auth — fixed min-width prevents layout shift while loading */}
            <div className="hidden md:flex items-center gap-3 min-w-[200px] justify-end">
              {loading ? (
                // Skeleton placeholder — same size as logged-out buttons
                <div className="flex items-center gap-2">
                  <div className="w-16 h-9 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="w-28 h-9 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              ) : authUser ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 border border-slate-200 hover:border-teal-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors"
                  >
                    <div className="w-7 h-7 bg-teal-100 text-teal-700 font-bold rounded-lg flex items-center justify-center text-xs shrink-0">
                      {initial}
                    </div>
                    <span className="max-w-[110px] truncate">{displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-0.5">
                        {/* User name */}
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {effectiveRoles.filter(Boolean).map(r => roleLabel[r ?? ""] ?? r).join(" · ")}
                          </p>
                        </div>

                        {/* Saved — always visible */}
                        <Link href="/patient/favorites" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                          <Heart className="w-4 h-4 text-red-400 shrink-0" />
                          Saved
                        </Link>

                        {/* My Appointments — always visible */}
                        <Link href="/patient/appointments" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors">
                          <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                          My Appointments
                        </Link>

                        {/* My Clinic — only if clinic owner */}
                        {effectiveRoles.includes("clinic_owner") && (
                          <Link href="/clinic/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors">
                            <Building2 className="w-4 h-4 text-teal-500 shrink-0" />
                            My Clinic
                          </Link>
                        )}

                        {/* Doctor Dashboard — only if doctor */}
                        {effectiveRoles.includes("doctor") && (
                          <Link href="/doctor/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors">
                            <Stethoscope className="w-4 h-4 text-violet-500 shrink-0" />
                            Doctor Dashboard
                          </Link>
                        )}

                        {/* My Lab — only if lab owner */}
                        {effectiveRoles.includes("lab_owner") && (
                          <Link href="/lab/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors">
                            <FlaskConical className="w-4 h-4 text-blue-500 shrink-0" />
                            My Lab
                          </Link>
                        )}

                        {/* My Pharmacy — only if pharmacy_owner */}
                        {effectiveRoles.includes("pharmacy_owner") && (
                          <Link href="/pharmacy/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors">
                            <Store className="w-4 h-4 text-green-500 shrink-0" />
                            My Pharmacy
                          </Link>
                        )}

                        {/* My Profile */}
                        <Link href="/patient/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors">
                          <User className="w-4 h-4 text-teal-500 shrink-0" />
                          My Profile
                        </Link>

                        <div className="border-t border-slate-100 my-1" />

                        <button onClick={handleSignOut}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left w-full">
                          <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : !loading ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openLogin(undefined)}
                    className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-950 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.3)] active:shadow-sm px-5 py-2 rounded-full"
                  >
                    Login / Register
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center gap-2">
              <Link href="/search" className="p-2 text-slate-600 hover:text-teal-600">
                <Search className="w-5 h-5" />
              </Link>
              <button className="p-2 text-slate-600 hover:text-teal-600 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white rounded-b-[22px] overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-2">
              <Link href="/search" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
                <Search className="w-4 h-4 text-teal-600" /> Find Doctors
              </Link>
              <Link href="/clinics" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
                <Building2 className="w-4 h-4 text-teal-600" /> Clinics
              </Link>
              <Link href="/labs" onClick={() => setMenuOpen(false)}
                className={cn("flex items-center gap-2 px-3 py-2.5 font-medium rounded-lg hover:bg-slate-50",
                  pathname === "/labs" && activeTab !== "tests" ? "bg-teal-50 text-teal-700" : "text-slate-700")}>
                <FlaskConical className="w-4 h-4 text-blue-500" /> Labs
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false)
                  window.dispatchEvent(new CustomEvent("open-ai-assistant"))
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-left"
              >
                <Sparkles className="w-4 h-4 text-teal-500 shrink-0" /> AI Assistant
              </button>
              {!effectiveRoles.includes("clinic_owner") && (
                <Link href="/clinic/register" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-teal-50">
                  <Building2 className="w-4 h-4 text-teal-600" /> Register My Clinic
                </Link>
              )}
              {!effectiveRoles.includes("doctor") && (
                <Link href="/doctor/register" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-violet-50">
                  <Stethoscope className="w-4 h-4 text-violet-600" /> Register Doctor
                </Link>
              )}
              {!effectiveRoles.includes("lab_owner") && (
                <Link href="/lab/register" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-blue-50">
                  <FlaskConical className="w-4 h-4 text-blue-500" /> Register My Lab
                </Link>
              )}
              {!effectiveRoles.includes("pharmacy_owner") && (
                <Link href="/pharmacy/register" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-slate-700 font-medium rounded-lg hover:bg-green-50">
                  <Store className="w-4 h-4 text-green-600" /> Register My Pharmacy
                </Link>
              )}

              <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
                {authUser ? (
                  <>
                    {/* User info */}
                    <div className="px-3 py-2 bg-slate-50 rounded-xl mb-1">
                      <p className="text-sm font-bold text-slate-900">{displayName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {effectiveRoles.filter(Boolean).map(r => roleLabel[r ?? ""] ?? r).join(" · ")}
                      </p>
                    </div>

                    {/* Saved */}
                    <Link href="/patient/favorites" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors">
                      <Heart className="w-4 h-4 text-red-400" /> Saved
                    </Link>

                    {/* My Appointments — always */}
                    <Link href="/patient/appointments" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors">
                      <Calendar className="w-4 h-4 text-teal-500" /> My Appointments
                    </Link>

                    {/* My Clinic — only if clinic_owner */}
                    {effectiveRoles.includes("clinic_owner") && (
                      <Link href="/clinic/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors">
                        <Building2 className="w-4 h-4 text-teal-500" /> My Clinic
                      </Link>
                    )}

                    {/* Doctor Dashboard — only if doctor */}
                    {effectiveRoles.includes("doctor") && (
                      <Link href="/doctor/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-violet-200 rounded-xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors">
                        <Stethoscope className="w-4 h-4 text-violet-500" /> Doctor Dashboard
                      </Link>
                    )}

                    {/* My Lab — only if lab_owner */}
                    {effectiveRoles.includes("lab_owner") && (
                      <Link href="/lab/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors">
                        <FlaskConical className="w-4 h-4 text-blue-500" /> My Lab
                      </Link>
                    )}

                    {/* My Pharmacy — only if pharmacy_owner */}
                    {effectiveRoles.includes("pharmacy_owner") && (
                      <Link href="/pharmacy/dashboard" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors">
                        <Store className="w-4 h-4 text-green-500" /> My Pharmacy
                      </Link>
                    )}

                    {/* My Profile */}
                    <Link href="/patient/profile" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 font-semibold border border-slate-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors">
                      <User className="w-4 h-4 text-teal-500" /> My Profile
                    </Link>

                    <button onClick={() => { handleSignOut(); setMenuOpen(false) }}
                      className="w-full text-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { openLogin(undefined); setMenuOpen(false) }}
                      className="w-full py-2.5 text-white font-semibold bg-slate-900 hover:bg-slate-950 transition-all duration-200 hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.3)] rounded-full text-center">
                      Login / Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>


      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sign Out</h3>
            <p className="text-sm text-slate-500 mb-5">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmSignOut}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="max-w-6xl mx-auto bg-gradient-to-r from-white/70 via-teal-50/30 to-white/70 backdrop-blur-md border border-teal-500/15 rounded-full mt-4 px-2 shadow-[0_10px_35px_-8px_rgba(13,148,136,0.12),0_4px_12px_rgba(0,0,0,0.03)] sticky top-4 h-16 flex items-center">
        <div className="mx-auto px-4 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="XYNCURE Logo" className="w-9 h-9 object-contain" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">XYN<span className="text-teal-600">CURE</span></span>
          </div>
          <div className="w-20 h-8 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
        </div>
      </nav>
    }>
      <NavbarContent />
    </Suspense>
  )
}
