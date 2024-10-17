'use client'

import { createContext, ReactNode, use, useContext, useEffect, useState } from 'react'
import { UserDetails } from '@/lib/db/schema'

type UserContextType = {
  user: UserDetails | null
  setUser: (user: UserDetails | null) => void
}

const UserContext = createContext<UserContextType | null>(null)

export function useUser(): UserContextType {
  let context = useContext(UserContext)
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode
  userPromise: Promise<UserDetails | null>
}) {
  let initialUser = use(userPromise)
  let [user, setUser] = useState<UserDetails | null>(initialUser)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
