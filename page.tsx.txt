export const dynamic = "force-dynamic"

import { Suspense } from "react"
import Navbar from "@/components/shared/Navbar"
import Footer from "@/components/shared/Footer"
import HeroSearch from "@/components/landing/HeroSearch"
import SpecialtyGrid from "@/components/landing/SpecialtyGrid"
import FeaturedDoctors from "@/components/landing/FeaturedDoctors"
import FeaturedClinics from "@/components/landing/FeaturedClinics"
import FeaturedLabs from "@/components/landing/FeaturedLabs"

function FeaturedDoctorsSkeleton() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 animate-pulse">
          <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
          <div className="h-8 w-52 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-slate-100 rounded-2xl p-4 flex items-start gap-4 min-h-[148px]">
              <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
              <div className="flex-1 flex flex-col gap-2.5 py-0.5">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-5 w-16 bg-slate-200 rounded" />
                  <div className="h-4 w-12 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50">
        <HeroSearch />
        <SpecialtyGrid />
        <Suspense fallback={<FeaturedDoctorsSkeleton />}>
          <FeaturedDoctors />
        </Suspense>
        <FeaturedClinics />
        <FeaturedLabs />
      </main>
      <Footer />
    </>
  )
}
