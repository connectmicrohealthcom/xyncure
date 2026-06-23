"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import CityDropdown from "../shared/CityDropdown"
import SearchSuggest from "../shared/SearchSuggest"

// Patient-friendly label → the actual specialty name in the DB (06_seeds.sql).
// e.g. patients say "Dentist" but the specialty is stored as "Dental".
const popularSearches: { label: string; q: string }[] = [
  { label: "General Physician", q: "General Medicine" },
  { label: "Dentist",           q: "Dental" },
  { label: "Dermatologist",     q: "Dermatology" },
  { label: "Gynaecologist",     q: "Gynaecology" },
  { label: "Paediatrician",     q: "Paediatrics" },
]
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"]

function MiniCalendar({
  selected,
  onSelect,
  onClose,
}: {
  selected: Date | null
  onSelect: (d: Date | null) => void
  onClose: () => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isPast = (day: number) => new Date(viewYear, viewMonth, day) < today
  const isSelected = (day: number) =>
    !!selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day

  const isTodayMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={isTodayMonth}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-slate-900 text-sm">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day ? (
              <button
                disabled={isPast(day)}
                onClick={() => { onSelect(new Date(viewYear, viewMonth, day)); onClose() }}
                className={cn(
                  "w-8 h-8 rounded-xl text-sm font-semibold transition-all",
                  isPast(day)
                    ? "text-slate-300 cursor-not-allowed"
                    : isSelected(day)
                    ? "bg-teal-600 text-white shadow-md"
                    : isToday(day)
                    ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Quick picks */}
      <div className="border-t border-slate-100 mt-3 pt-3 flex gap-2">
        <button
          onClick={() => { onSelect(new Date()); onClose() }}
          className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            const d = new Date(); d.setDate(d.getDate() + 1)
            onSelect(d); onClose()
          }}
          className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 transition-colors"
        >
          Tomorrow
        </button>
        <button
          onClick={() => { onSelect(null); onClose() }}
          className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-500 border border-slate-200 transition-colors"
        >
          Any Date
        </button>
      </div>
    </div>
  )
}

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [city, setCity] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const [activeSection, setActiveSection] = useState<"search" | "city" | "date" | null>(null)
  
  const searchBoxRef = useRef<HTMLDivElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global click outside handler
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setActiveSection(null)
      }
    }
    document.addEventListener("mousedown", handleGlobalClick)
    return () => document.removeEventListener("mousedown", handleGlobalClick)
  }, [])

  const dateLabel = () => {
    if (!selectedDate) return "Any Date"
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    if (selectedDate.toDateString() === today.toDateString()) return "Today"
    if (selectedDate.toDateString() === tomorrow.toDateString()) return "Tomorrow"
    return selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (city) {
      params.set("city", city)
      if (city === "Near Me" && coords) {
        params.set("lat", String(coords.lat))
        params.set("lng", String(coords.lng))
      }
    }
    if (selectedDate) {
      const localDateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split("T")[0]
      params.set("date", localDateStr)
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative w-full z-20 overflow-visible bg-gradient-to-br from-[#F0FDFA] via-white to-[#ECFDF5] -mt-20">
      {/* Background glows — own overflow wrapper so calendar is unclipped */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Central teal radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[100px] opacity-[0.45]" style={{ background: "radial-gradient(ellipse, #99F6E4 0%, transparent 70%)" }} />
        {/* Bottom-right emerald accent */}
        <div className="absolute bottom-0 right-0 w-[450px] h-[300px] rounded-full blur-[90px] opacity-[0.35]" style={{ background: "radial-gradient(ellipse, #A7F3D0 0%, transparent 70%)" }} />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(15,23,42,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.15) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 sm:pt-56 pb-16 sm:pb-24 z-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 bg-teal-50 border border-teal-200/60 text-teal-700">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          Kerala&apos;s Fastest Doctor Booking
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-serif mb-4 leading-tight tracking-tight">
          Find. Book. <span className="text-teal-600">Done.</span>
        </h1>
        <p className="text-slate-500 text-base sm:text-lg mb-10 max-w-xl mx-auto font-medium">
          Book a doctor appointment instantly. WhatsApp confirmation in seconds.
        </p>

        {/* Search box */}
        <div
          ref={searchBoxRef}
          className={cn(
            "transition-all duration-300 rounded-2xl sm:rounded-full p-2 sm:p-1 flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 border sm:h-16 sm:overflow-visible relative",
            activeSection 
              ? "bg-white/95 border-transparent shadow-[0_20px_50px_rgba(27,34,60,0.15)]" 
              : "bg-white/80 backdrop-blur-md border-transparent shadow-[0_15px_40px_rgba(27,34,60,0.08)]"
          )}
        >
          {/* Specialty / doctor with suggestions */}
          <div
            onClick={() => inputRef.current?.focus()}
            className={cn(
              "flex-[1.5] relative rounded-xl sm:rounded-full px-4 py-2 sm:px-6 flex items-center min-h-[52px] sm:min-h-0 transition-colors duration-200 sm:h-full cursor-text",
              activeSection !== "search" && "hover:bg-slate-200/40 sm:hover:bg-white/40"
            )}
          >
            {activeSection === "search" && (
              <motion.div
                layoutId="activeSearchPill"
                className="absolute inset-0 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-full z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-3 w-full bg-transparent">
              <Search className="w-5 h-5 text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setActiveSection("search")}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Doctor name, specialty, city..."
                className="w-full text-slate-900 bg-transparent outline-none text-sm placeholder:text-slate-400 font-medium"
              />
            </div>
            <SearchSuggest
              query={query}
              navigateOnSelect={true}
            />
          </div>

          <div className={cn(
            "hidden sm:block w-px h-8 bg-slate-200 mx-1 self-center transition-all duration-200",
            (activeSection === "search" || activeSection === "city") && "opacity-0"
          )} />

          {/* City */}
          <div className={cn(
            "flex-1 relative rounded-xl sm:rounded-full flex items-center min-h-[52px] sm:min-h-0 px-1 sm:px-2 transition-colors duration-200 sm:h-full",
            activeSection !== "city" && "hover:bg-slate-200/40 sm:hover:bg-white/40"
          )}>
            {activeSection === "city" && (
              <motion.div
                layoutId="activeSearchPill"
                className="absolute inset-0 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-full z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 w-full h-full flex items-center">
              <CityDropdown
                value={city}
                onChange={(cityVal, coordsVal) => {
                  setCity(cityVal)
                  setCoords(coordsVal || null)
                }}
                placeholder="Any City"
                borderless={true}
                className="w-full h-full"
                buttonClassName="bg-transparent hover:bg-transparent rounded-none w-full h-full py-0 flex items-center text-slate-800 font-medium text-sm"
                onOpenChange={(open) => setActiveSection(open ? "city" : null)}
                open={activeSection === "city"}
              />
            </div>
          </div>

          <div className={cn(
            "hidden sm:block w-px h-8 bg-slate-200 mx-1 self-center transition-all duration-200",
            (activeSection === "city" || activeSection === "date") && "opacity-0"
          )} />

          {/* Date picker */}
          <div
            ref={calendarRef}
            className={cn(
              "flex-[0.7] relative rounded-xl sm:rounded-full flex items-center min-h-[52px] sm:min-h-0 pl-1 sm:pl-2 pr-1 transition-colors duration-200 sm:h-full justify-between",
              activeSection !== "date" && "hover:bg-slate-200/40 sm:hover:bg-white/40"
            )}
          >
            {activeSection === "date" && (
              <motion.div
                layoutId="activeSearchPill"
                className="absolute inset-0 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-full z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center justify-between w-full h-full gap-1">
              <button
                onClick={() => setActiveSection(activeSection === "date" ? null : "date")}
                className="flex items-center gap-3 px-3 py-3 bg-transparent rounded-none flex-1 h-full transition-colors cursor-pointer text-left focus:outline-none min-w-0"
              >
                <Calendar className="w-5 h-5 text-slate-500 shrink-0" />
                <span className={cn(
                  "text-sm flex-1 truncate font-medium",
                  selectedDate ? "text-teal-600 font-semibold" : "text-slate-500"
                )}>
                  {dateLabel()}
                </span>
                {selectedDate && (
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedDate(null) }}
                    className="text-slate-400 hover:text-slate-600 relative z-20 shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </button>

              {/* Desktop search button (nested inside date picker to extend under it) */}
              <motion.button
                layout
                onClick={(e) => {
                  e.stopPropagation()
                  handleSearch()
                }}
                className={cn(
                  "hidden sm:flex bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold transition-all duration-300 shadow-md shadow-orange-500/20 hover:scale-105 shrink-0 items-center justify-center cursor-pointer relative z-20",
                  activeSection !== null
                    ? "px-6 py-3 rounded-full h-12 gap-2"
                    : "w-12 h-12 rounded-full"
                )}
                title="Search"
              >
                <Search className="w-5 h-5 text-white shrink-0" />
                <AnimatePresence>
                  {activeSection !== null && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-bold whitespace-nowrap overflow-hidden inline-block"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {activeSection === "date" && (
              <div className="absolute top-full mt-2 right-0 z-50">
                <MiniCalendar
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  onClose={() => setActiveSection(null)}
                />
              </div>
            )}
          </div>

          {/* Mobile search button */}
          <button
            onClick={handleSearch}
            className="sm:hidden bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md shadow-orange-500/20 w-full cursor-pointer mt-1"
          >
            <Search className="w-5 h-5 text-white shrink-0" />
            <span className="text-sm font-bold">Search</span>
          </button>
        </div>

        {/* Popular searches */}
        <div className="mt-5 flex flex-wrap justify-center items-center gap-2">
          <span className="text-slate-500 text-xs font-semibold">Popular:</span>
          {popularSearches.map(s => (
            <button
              key={s.label}
              onClick={() => router.push(`/search?q=${encodeURIComponent(s.q)}`)}
              className="text-slate-500 hover:text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all border border-slate-200/60 hover:border-slate-350 bg-white hover:bg-slate-50/50 shadow-sm duration-200"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* WhatsApp trust signal */}
        <div className="mt-5 flex justify-center items-center gap-2">
          <span
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full border bg-green-50/70 border-green-200/60 text-green-700"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            Instant WhatsApp confirmation, no app needed
          </span>
        </div>
      </div>
    </section>
  )
}
