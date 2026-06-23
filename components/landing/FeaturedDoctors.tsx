import Link from "next/link"
import { ArrowRight, User } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"

type Doctor = {
  id: string
  name: string
  slug: string
  qualifications: string | null
  consultation_fee: number
  avatar_url: string | null
  experience_years: number | null
  available_today: boolean
  accept_online_booking: boolean
  specialty: { name_en: string; icon: string | null } | null
  clinic: { name: string; city: string } | null
}

// Gradient per specialty for avatar fallback — more premium than a flat colour
const SPECIALTY_GRADIENTS: Record<string, string> = {
  "General Medicine": "from-teal-400 to-teal-600",
  "Paediatrics":      "from-rose-400 to-rose-600",
  "Cardiology":       "from-red-400 to-red-600",
  "Dermatology":      "from-sky-400 to-sky-600",
  "Gynaecology":      "from-purple-400 to-purple-600",
  "Dental":           "from-emerald-400 to-emerald-600",
  "Orthopaedics":     "from-amber-400 to-amber-600",
  "Neurology":        "from-indigo-400 to-indigo-600",
  "Ophthalmology":    "from-cyan-400 to-cyan-600",
}

export default async function FeaturedDoctors() {
  let doctors: Doctor[] = []
  const avgRatingMap = new Map<string, number>()

  try {
    const supabase = getSupabaseServer()

    const { data } = await supabase
      .from("doctors")
      .select(`
        id, name, slug, qualifications, consultation_fee, avatar_url,
        experience_years, available_today, accept_online_booking,
        specialty:specialties(name_en, icon),
        clinic:clinics(name, city)
      `)
      .eq("active", true)
      .limit(4)

    if (!data || data.length === 0) return null
    doctors = data as unknown as Doctor[]

    const { data: reviewData } = await supabase
      .from("reviews")
      .select("doctor_id, rating")
      .in("doctor_id", doctors.map(d => d.id))

    const ratingAccum = new Map<string, { sum: number; count: number }>()
    for (const r of reviewData ?? []) {
      const entry = ratingAccum.get(r.doctor_id) ?? { sum: 0, count: 0 }
      entry.sum += r.rating
      entry.count += 1
      ratingAccum.set(r.doctor_id, entry)
    }
    for (const [id, { sum, count }] of ratingAccum) {
      if (count >= 5) avgRatingMap.set(id, sum / count)
    }
  } catch (err) {
    console.error("Failed to load featured doctors:", err)
  }

  if (doctors.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Featured Doctors
          </h2>
          <Link href="/search" className="hidden sm:inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-sm group">
            Browse All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {doctors.map((doc) => {
            const specialty        = doc.specialty
            const clinic           = doc.clinic
            const rating           = avgRatingMap.get(doc.id) ?? null
            const isAvailableToday = doc.available_today && doc.accept_online_booking
            const avatarGradient   = SPECIALTY_GRADIENTS[specialty?.name_en ?? ""] ?? "from-teal-400 to-teal-600"
            const primaryQual      = doc.qualifications?.split(",")[0]?.trim() ?? null

            return (
              <Link
                key={doc.id}
                href={`/doctor/${doc.slug}`}
                className="group bg-white border border-slate-100 hover:border-teal-500/20 rounded-[22px] p-5 hover:shadow-[0_20px_40px_-15px_rgba(13,148,136,0.12),0_4px_12px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3.5"
              >
                {/* Top row: avatar + name block */}
                <div className="flex items-start gap-3.5">
                  {/* Avatar with light grey fallback */}
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400 shrink-0 shadow-sm ring-4 ring-slate-50 group-hover:ring-teal-50 transition-all duration-300">
                    {doc.avatar_url
                      ? <img src={doc.avatar_url} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <User className="w-10 h-10 text-slate-400" />
                    }
                  </div>

                  {/* Name + specialty + availability */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Availability badge — highest priority signal */}
                    {isAvailableToday ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200/60 px-2.5 py-0.5 rounded-full mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                        Available today
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-semibold text-slate-400 mb-1.5">
                        Check availability →
                      </span>
                    )}

                    <h3 className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors text-sm leading-tight truncate">
                      {doc.name}
                    </h3>

                    {/* Qualification */}
                    {primaryQual && (
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{primaryQual}</p>
                    )}

                    {/* Specialty */}
                    {specialty && (
                      <p className="text-[11px] text-teal-600 font-bold mt-1">{specialty.name_en}</p>
                    )}
                  </div>
                </div>

                {/* Meta row: experience + rating */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                  {doc.experience_years != null && (
                    <span className="bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                      {doc.experience_years} Yrs Exp
                    </span>
                  )}
                  {rating != null && (
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                      ★ <span className="text-slate-700 font-semibold">{rating.toFixed(1)}</span>
                    </span>
                  )}
                  {clinic && (
                    <span className="text-slate-400 truncate">{clinic.city}</span>
                  )}
                </div>

                {/* Footer: fee + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Consultation Fee</span>
                    <span className="text-sm font-black text-slate-950 mt-1">{formatCurrency(doc.consultation_fee)}</span>
                  </div>
                  <span className="text-xs font-bold text-white bg-slate-900 group-hover:bg-teal-600 px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm flex items-center gap-0.5 group-hover:shadow-md group-hover:shadow-teal-500/10">
                    Book Now
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/search"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm">
            Browse All Doctors <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
