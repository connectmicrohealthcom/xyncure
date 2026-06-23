"use client"

  export type UserRole =
    | "patient" | "clinic_owner" | "clinic_staff"
    | "lab_owner" | "lab_staff" | "pharmacy_owner"
    | "pharmacy_staff" | "doctor" | "superadmin"

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
      patient: "/patient/appointments",
      clinic_owner: "/clinic/dashboard",
      clinic_staff: "/clinic/dashboard",
      lab_owner: "/lab/dashboard",
      lab_staff: "/lab/dashboard",
      pharmacy_owner: "/pharmacy/dashboard",
      pharmacy_staff: "/pharmacy/dashboard",
      doctor: "/doctor/dashboard",
      superadmin: "/admin",
    }
    return paths[role] ?? "/"
  }

  // Static stub — always returns logged-out state (no Firebase needed)
  export function useUserRole() {
    return { authUser: null as AuthUser | null, loading: false }
  }
  