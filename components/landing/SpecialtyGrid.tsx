"use client"

import Link from "next/link"
import { ArrowRight, Stethoscope, Baby, HeartPulse, Sparkles, Flower2, Smile } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Specialty = {
  name: string
  slug: string
  desc: string
  Icon: LucideIcon
}

export const FEATURED_SPECIALTIES: Specialty[] = [
  { name: "General Medicine", slug: "general-medicine", desc: "Fever, checkups, primary care", Icon: Stethoscope },
  { name: "Paediatrics",      slug: "paediatrics",      desc: "Child & infant health",         Icon: Baby       },
  { name: "Cardiology",       slug: "cardiology",       desc: "Heart & blood pressure",        Icon: HeartPulse },
  { name: "Dermatology",      slug: "dermatology",      desc: "Skin, hair & cosmetic",         Icon: Sparkles   },
  { name: "Gynaecology",      slug: "gynaecology",      desc: "Women's health & pregnancy",    Icon: Flower2    },
  { name: "Dental & Oral",    slug: "dental",           desc: "Teeth, gums & oral care",       Icon: Smile      },
]

export const SECONDARY_SPECIALTIES = [
  { name: "Orthopaedics", slug: "orthopaedics" },
  { name: "ENT Specialist", slug: "ent" },
  { name: "Ophthalmology (Eye)", slug: "ophthalmology" },
  { name: "Neurology", slug: "neurology" },
  { name: "Psychiatry", slug: "psychiatry" },
  { name: "Gastroenterology", slug: "gastroenterology" },
  { name: "Pulmonology", slug: "pulmonology" },
  { name: "Endocrinology", slug: "endocrinology" },
  { name: "Urology", slug: "urology" },
  { name: "Physiotherapy", slug: "physiotherapy" },
  { name: "Oncology (Cancer)", slug: "oncology" },
  { name: "General Surgery", slug: "general-surgery" },
  { name: "Ayurveda Medicine", slug: "ayurveda" },
  { name: "Homeopathy", slug: "homeopathy" },
  { name: "Rheumatology", slug: "rheumatology" },
  { name: "Nephrology (Kidney)", slug: "nephrology" },
  { name: "Diabetology", slug: "diabetology" },
]

export default function SpecialtyGrid() {
  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">Specialties</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif">
            Browse by Specialty
          </h2>
        </div>

        {/* Compact row of cards with scrollbar hidden */}
        <div className="flex flex-row overflow-x-auto gap-4 pb-4 px-4 sm:px-0 -mx-4 sm:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FEATURED_SPECIALTIES.map((s) => (
            <Link
              key={s.slug}
              href={`/search?specialty=${s.slug}`}
              className="group relative rounded-2xl overflow-hidden w-36 sm:w-44 aspect-[1.1] shrink-0 block shadow-sm border border-slate-100"
            >
              <img
                src={`/specialties/${s.slug}.jpg`}
                alt={s.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-slate-900/10" />
              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.05] transition-colors duration-300" />
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-3 z-10">
                <div className="w-6 h-6 rounded-md bg-white/15 backdrop-blur-sm flex items-center justify-center mb-1.5">
                  <s.Icon className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="font-extrabold text-white text-[13px] sm:text-sm leading-tight truncate">{s.name}</h3>
                <p className="text-white/60 text-[10px] sm:text-[11px] mt-0.5 leading-snug truncate">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/25 text-slate-600 hover:text-teal-700 px-5 py-2.5 rounded-full text-sm font-semibold font-serif transition-all duration-200 shadow-sm"
          >
            Explore All Specialties ({SECONDARY_SPECIALTIES.length} more)
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
