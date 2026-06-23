"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export type UserRole =
  | "patient"
  | "clinic_owner"
  | "clinic_staff"
  | "lab_owner"
  | "lab_staff"
  | "pharmacy_owner"
  | "pharmacy_staff"
  | "doctor"
  | "superadmin"

export interface AuthUser {
  uid: string
  name: string | null
  phone: string | null
  email: string | null
  role: UserRole
  roles: UserRole[]
}

export function dashboardPathForRole(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    patient:          "/patient/appointments",
    clinic_owner:     "/clinic/dashboard",
    clinic_staff:     "/clinic/dashboard",
    lab_owner:        "/lab/dashboard",
    lab_staff:        "/lab/dashboard",
    pharmacy_owner:   "/pharmacy/dashboard",
    pharmacy_staff:   "/pharmacy/dashboard",
    doctor:           "/doctor/dashboard",
    superadmin:       "/admin",
  }
  return paths[role] ?? "/"
}

export function useUserRole() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setAuthUser(null)
        setLoading(false)
        return
      }

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid))
        if (snap.exists()) {
          const data = snap.data()
          setAuthUser({
            uid:   firebaseUser.uid,
            name:  data.name ?? firebaseUser.displayName ?? null,
            phone: data.phone ?? firebaseUser.phoneNumber ?? null,
            email: data.email ?? firebaseUser.email ?? null,
            role:  data.role ?? "patient",
            roles: data.roles ?? [data.role ?? "patient"],
          })
        } else {
          setAuthUser({
            uid:   firebaseUser.uid,
            name:  firebaseUser.displayName,
            phone: firebaseUser.phoneNumber,
            email: firebaseUser.email,
            role:  "patient",
            roles: ["patient"],
          })
        }
      } catch {
        setAuthUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  return { authUser, loading }
}
