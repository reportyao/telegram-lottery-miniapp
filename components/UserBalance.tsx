'use client'

import { User } from '@/types/database'

interface UserBalanceProps {
  user?: User | null
  balance?: number
}

export default function UserBalance({ user, balance }: UserBalanceProps) {
  const displayBalance = balance !== undefined ? balance : (user?.balance || 0)
  const displayName = user?.full_name || user?.username || 'User'
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">Welcome, {displayName}</p>
      </div>
      <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
        <p className="text-xs opacity-90">Balance</p>
        <p className="text-lg font-bold">${parseFloat(displayBalance.toString()).toFixed(2)}</p>
      </div>
    </div>
  )
}
