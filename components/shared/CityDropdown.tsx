"use client"

import { useState, useRef, useEffect } from "react"
import { MapPin, ChevronDown, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

const KERALA_CITIES = [
  "Thiruvananthapuram",
  "Kochi",
  "Kozhikode",
  "Thrissur",
  "Kollam",
  "Kannur",
  "Alappuzha",
  "Palakkad",
  "Malappuram",
  "Kottayam",
  "Pathanamthitta",
  "Idukki",
  "Wayanad",
  "Kasaragod",
]

interface CityDropdownProps {
  value: string
  onChange: (city: string, coords?: { lat: number; lng: number } | null) => void
  placeholder?: string
  borderless?: boolean
  className?: string
  buttonClassName?: string
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export default function CityDropdown({
  value,
  onChange,
  placeholder = "Any City",
  borderless = false,
  className,
  buttonClassName,
  onOpenChange,
  open: controlledOpen,
}: CityDropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const ref = useRef<HTMLDivElement>(null)

  const setOpen = (v: boolean) => {
    setInternalOpen(v)
    onOpenChange?.(v)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleNearMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange("Near Me", { lat: pos.coords.latitude, lng: pos.coords.longitude })
        setOpen(false)
      },
      () => setOpen(false)
    )
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
          !borderless && "border border-slate-200 bg-white hover:border-teal-300",
          buttonClassName
        )}
      >
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <span className={cn("truncate", value ? "text-slate-800" : "text-slate-400")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 ml-auto transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 max-h-72 overflow-y-auto">
          <button
            onClick={() => { onChange(""); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors font-medium"
          >
            Any City
          </button>
          <button
            onClick={handleNearMe}
            className="w-full text-left px-4 py-2.5 text-sm text-teal-600 hover:bg-teal-50 transition-colors font-semibold flex items-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5" /> Near Me
          </button>
          <div className="border-t border-slate-100 my-1" />
          {KERALA_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => { onChange(city, null); setOpen(false) }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-sm transition-colors font-medium",
                value === city
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
