import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"

type Clinic = {
  id: string
  name: string
  slug: string
  qr_token: string | null
  city: string | null
  district: string | null
  category: string | null
  logo_url: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  allopathy:  "General Medicine",
  dental:     "Dental Care",
  ayurveda:   "Ayurvedic",
  homeopathy: "Homeopathy",
  multi:      "Multi-Specialty",
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  allopathy:  { bg: "bg-teal-50",    text: "text-teal-700" },
  dental:     { bg: "bg-emerald-50", text: "text-emerald-700" },
  ayurveda:   { bg: "bg-orange-50",  text: "text-orange-700" },
  homeopathy: { bg: "bg-purple-50",  text: "text-purple-700" },
  multi:      { bg: "bg-sky-50",     text: "text-sky-700" },
}

export default async function FeaturedClinics() {
  let clinics: Clinic[] = []
  try {
    const supabase = getSupabaseServer()
    const { data } = await supabase
      .from("clinics")
      .select("id, name, slug, qr_token, city, district, category, logo_url")
      .eq("active", true)
      .limit(4)
    clinics = (data ?? []) as Clinic[]
  } catch (err) {
    console.error("Failed to load featured clinics:", err)
  }

  if (clinics.length === 0) return null

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Featured Clinics
          </h2>
          <Link href="/clinics" className="hidden sm:inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-sm group">
            Browse All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Row layout — different from the card grid in FeaturedDoctors */}
        <div className="space-y-3">
          {clinics.map((clinic) => {
            const initials = clinic.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
            const label    = CATEGORY_LABELS[clinic.category ?? ""] ?? clinic.category
            const colors   = CATEGORY_COLORS[clinic.category ?? ""] ?? { bg: "bg-teal-50", text: "text-teal-700" }
            const href     = `/c/${clinic.qr_token ?? clinic.slug}`

            return (
              <Link
                key={clinic.id}
                href={href}
                className="group flex items-center gap-4 bg-white border border-slate-100 hover:border-teal-500/20 rounded-2xl px-5 py-4 hover:shadow-[0_12px_30px_-10px_rgba(13,148,136,0.08)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Logo */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-xs overflow-hidden shadow-sm shrink-0 ring-4 ring-slate-50 group-hover:ring-teal-50 transition-all duration-300">
                  {clinic.logo_url
                    ? <img src={clinic.logo_url} alt={clinic.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : initials
                  }
                </div>

                {/* Name + location */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors text-sm leading-snug truncate">
                    {clinic.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-500 truncate">
                      {clinic.district ? `${clinic.district}, ` : ""}{clinic.city}
                    </span>
                  </div>
                </div>

                {/* Category pill */}
                {label && (
                  <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${colors.bg} ${colors.text}`}>
                    {label}
                  </span>
                )}

                {/* CTA arrow */}
                <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-all flex items-center gap-1.5 shrink-0 bg-slate-50 group-hover:bg-teal-50 px-3.5 py-1.5 rounded-full border border-slate-100 group-hover:border-teal-100">
                  View &amp; Book
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/clinics"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm">
            Browse All Clinics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
