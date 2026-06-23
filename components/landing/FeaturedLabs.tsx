import Link from "next/link"
import { MapPin, ArrowRight, Home, BadgeCheck, FlaskConical } from "lucide-react"
import { getSupabaseServer } from "@/lib/supabase/server"

type Lab = {
  id: string
  name: string
  slug: string
  city: string | null
  logo_url: string | null
  home_collection: boolean
  accreditations: string[] | null
}

export default async function FeaturedLabs() {
  let labs: Lab[] = []
  try {
    const supabase = getSupabaseServer()
    const { data } = await supabase
      .from("labs")
      .select("id, name, slug, city, logo_url, home_collection, accreditations")
      .eq("active", true)
      .limit(4)
    labs = (data ?? []) as Lab[]
  } catch (err) {
    console.error("Failed to load featured labs:", err)
  }

  if (labs.length === 0) return null

  const [featured, ...rest] = labs

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
            Featured Labs
          </h2>
          <Link href="/labs" className="hidden sm:inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 shadow-sm group">
            Browse All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Asymmetric layout — large featured left, compact list right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">

          {/* Featured lab — large card */}
          {featured && (() => {
            const isNabl = (featured.accreditations ?? []).includes("NABL")
            return (
              <Link
                href={`/lab/${featured.slug}`}
                className="group bg-white border border-slate-100 hover:border-teal-500/20 rounded-[24px] p-6 hover:shadow-[0_20px_40px_-15px_rgba(13,148,136,0.12),0_4px_12px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 flex flex-col min-h-[220px]"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white overflow-hidden shadow-sm ring-4 ring-slate-50 group-hover:ring-teal-50 transition-all duration-300">
                    {featured.logo_url
                      ? <img src={featured.logo_url} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <FlaskConical className="w-6 h-6 group-hover:rotate-6 transition-transform duration-300" />
                    }
                  </div>
                  {isNabl && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" /> NABL Accredited
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors text-lg leading-snug mb-2 flex-1">
                  {featured.name}
                </h3>

                {featured.city && (
                  <div className="flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-500">{featured.city}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  {featured.home_collection && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      <Home className="w-3 h-3" /> Home collection
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-all flex items-center gap-1.5 bg-slate-50 group-hover:bg-teal-50 px-3.5 py-1.5 rounded-full border border-slate-100 group-hover:border-teal-100">
                    Browse tests <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            )
          })()}

          {/* Compact list for remaining labs */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-3">
              {rest.map((lab) => {
                const isNabl = (lab.accreditations ?? []).includes("NABL")
                return (
                  <Link
                    key={lab.id}
                    href={`/lab/${lab.slug}`}
                    className="group flex items-center gap-4 bg-white border border-slate-100 hover:border-teal-500/20 rounded-2xl px-4 py-3.5 hover:shadow-[0_12px_30px_-10px_rgba(13,148,136,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white overflow-hidden shadow-sm shrink-0 ring-4 ring-slate-50 group-hover:ring-teal-50 transition-all duration-300">
                      {lab.logo_url
                        ? <img src={lab.logo_url} alt={lab.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <FlaskConical className="w-4 h-4 group-hover:rotate-6 transition-transform duration-300" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors text-sm truncate">
                        {lab.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lab.city && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {lab.city}
                          </span>
                        )}
                        {lab.home_collection && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            Home
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isNabl && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          <BadgeCheck className="w-3 h-3" /> NABL
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-all flex items-center gap-1 bg-slate-50 group-hover:bg-teal-50 p-1.5 rounded-full border border-slate-100 group-hover:border-teal-100">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/labs"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm">
            Browse All Labs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
