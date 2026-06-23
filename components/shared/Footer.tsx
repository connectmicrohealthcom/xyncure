"use client"

import Link from "next/link"
import { Stethoscope } from "lucide-react"

const links = [
  { label: "Find Doctors", href: "/search" },
  { label: "Browse Clinics", href: "/clinics" },
  { label: "AI Symptom Checker", href: "/assistant" },
  { label: "Register Clinic", href: "/clinic/register" },
  { label: "Security", href: "/security" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
]

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="XYNCURE Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-slate-900 tracking-tight">
              XYN<span className="text-teal-600">CURE</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs">Book a doctor in Kerala. No calls, no wait.</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {links.map(l => {
            if (l.href === "/assistant") {
              return (
                <button
                  key={l.href}
                  onClick={() => window.dispatchEvent(new CustomEvent("open-ai-assistant"))}
                  className="text-xs text-slate-500 hover:text-teal-600 transition-colors text-left font-medium cursor-pointer"
                >
                  {l.label}
                </button>
              )
            }
            return (
              <Link key={l.href} href={l.href} className="text-xs text-slate-500 hover:text-teal-600 transition-colors font-medium">
                {l.label}
              </Link>
            )
          })}
        </div>

      </div>

      {/* Bottom strip */}
      <div className="border-t border-slate-200/60 bg-slate-100/50">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Xynvia Private Limited. All rights reserved.</span>
          <div className="flex items-center gap-4 font-medium">
            <a
              href="https://wa.me/917356347253"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors"
            >
              WhatsApp
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="https://www.instagram.com/Xyncure?utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
