import Link from "next/link"
  import { ArrowRight, User } from "lucide-react"

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

  const MOCK_DOCTORS: Doctor[] = [
    {
      id: "1", name: "Dr. Priya Nair", slug: "dr-priya-nair",
      qualifications: "MBBS, MD (General Medicine)", consultation_fee: 500,
      avatar_url: null, experience_years: 12, available_today: true, accept_online_booking: true,
      specialty: { name_en: "General Medicine", icon: null },
      clinic: { name: "Nair Clinic", city: "Kochi" },
    },
    {
      id: "2", name: "Dr. Arjun Menon", slug: "dr-arjun-menon",
      qualifications: "BDS, MDS (Orthodontics)", consultation_fee: 400,
      avatar_url: null, experience_years: 8, available_today: false, accept_online_booking: true,
      specialty: { name_en: "Dental", icon: null },
      clinic: { name: "SmileCare Dental", city: "Thiruvananthapuram" },
    },
    {
      id: "3", name: "Dr. Sunitha Krishnan", slug: "dr-sunitha-krishnan",
      qualifications: "MBBS, MD (Dermatology)", consultation_fee: 700,
      avatar_url: null, experience_years: 15, available_today: true, accept_online_booking: true,
      specialty: { name_en: "Dermatology", icon: null },
      clinic: { name: "SkinCare Centre", city: "Kozhikode" },
    },
    {
      id: "4", name: "Dr. Rahul Varma", slug: "dr-rahul-varma",
      qualifications: "MBBS, DCH (Paediatrics)", consultation_fee: 600,
      avatar_url: null, experience_years: 10, available_today: true, accept_online_booking: true,
      specialty: { name_en: "Paediatrics", icon: null },
      clinic: { name: "ChildFirst Hospital", city: "Thrissur" },
    },
  ]

  const SPECIALTY_GRADIENTS: Record<string, string> = {
    "General Medicine": "from-teal-400 to-teal-600",
    "Paediatrics":      "from-rose-400 to-rose-600",
    "Cardiology":       "from-red-400 to-red-600",
    "Dermatology":      "from-sky-400 to-sky-600",
    "Gynaecology":      "from-purple-400 to-purple-600",
    "Dental":           "from-emerald-400 to-emerald-600",
  }

  export default function FeaturedDoctors() {
    const doctors = MOCK_DOCTORS
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
              const isAvailableToday = doc.available_today && doc.accept_online_booking
              const avatarGradient   = SPECIALTY_GRADIENTS[specialty?.name_en ?? ""] ?? "from-teal-400 to-teal-600"
              const primaryQual      = doc.qualifications?.split(",")[0]?.trim() ?? null

              return (
                <Link
                  key={doc.id}
                  href={`/doctor/${doc.slug}`}
                  className="group bg-white border border-slate-100 hover:border-teal-500/20 rounded-[22px] p-5 hover:shadow-[0_20px_40px_-15px_rgba(13,148,136,0.12),0_4px_12px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3.5"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white shrink-0 shadow-sm ring-4 ring-slate-50 group-hover:ring-teal-50 transition-all duration-300`}>
                      {doc.avatar_url
                        ? <img src={doc.avatar_url} alt={doc.name} className="w-full h-full object-cover" />
                        : <User className="w-10 h-10 text-white/80" />
                      }
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      {isAvailableToday ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200/60 px-2.5 py-0.5 rounded-full mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                          Available today
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-semibold text-slate-400 mb-1.5">Check availability →</span>
                      )}
                      <h3 className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors text-sm leading-tight truncate">{doc.name}</h3>
                      {primaryQual && <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{primaryQual}</p>}
                      {specialty && <p className="text-[11px] text-teal-600 font-bold mt-1">{specialty.name_en}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    {doc.experience_years != null && (
                      <span className="bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                        {doc.experience_years} Yrs Exp
                      </span>
                    )}
                    {clinic && <span className="text-slate-400 truncate">{clinic.city}</span>}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Consultation Fee</span>
                      <span className="text-sm font-black text-slate-950 mt-1">₹{doc.consultation_fee}</span>
                    </div>
                    <span className="text-xs font-bold text-white bg-slate-900 group-hover:bg-teal-600 px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm">
                      Book Now
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/search" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm">
              Browse All Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    )
  }
  