"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, User, Building2, FlaskConical } from "lucide-react"

interface Suggestion {
  type: "doctor" | "clinic" | "lab" | "specialty"
  label: string
  sublabel?: string
  href: string
}

const STATIC_SPECIALTIES: Suggestion[] = [
  { type: "specialty", label: "General Medicine", href: "/search?specialty=general-medicine" },
  { type: "specialty", label: "Paediatrics", href: "/search?specialty=paediatrics" },
  { type: "specialty", label: "Cardiology", href: "/search?specialty=cardiology" },
  { type: "specialty", label: "Dermatology", href: "/search?specialty=dermatology" },
  { type: "specialty", label: "Gynaecology", href: "/search?specialty=gynaecology" },
  { type: "specialty", label: "Dental", href: "/search?specialty=dental" },
  { type: "specialty", label: "Orthopaedics", href: "/search?specialty=orthopaedics" },
  { type: "specialty", label: "Neurology", href: "/search?specialty=neurology" },
  { type: "specialty", label: "Ophthalmology", href: "/search?specialty=ophthalmology" },
  { type: "specialty", label: "ENT", href: "/search?specialty=ent" },
]

const IconForType = ({ type }: { type: Suggestion["type"] }) => {
  if (type === "doctor") return <User className="w-4 h-4 text-teal-500" />
  if (type === "clinic") return <Building2 className="w-4 h-4 text-teal-500" />
  if (type === "lab") return <FlaskConical className="w-4 h-4 text-blue-500" />
  return <Search className="w-4 h-4 text-slate-400" />
}

interface SearchSuggestProps {
  query: string
  navigateOnSelect?: boolean
}

export default function SearchSuggest({ query, navigateOnSelect }: SearchSuggestProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }
    const q = query.toLowerCase()
    const matches = STATIC_SPECIALTIES.filter((s) =>
      s.label.toLowerCase().includes(q)
    ).slice(0, 6)
    setSuggestions(matches)
  }, [query])

  if (!suggestions.length) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onMouseDown={(e) => {
            e.preventDefault()
            if (navigateOnSelect) router.push(s.href)
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
        >
          <IconForType type={s.type} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{s.label}</p>
            {s.sublabel && <p className="text-xs text-slate-400">{s.sublabel}</p>}
          </div>
        </button>
      ))}
    </div>
  )
}
