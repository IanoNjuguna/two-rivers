'use client'

import React from 'react'
import { TrendingUp, Calendar, DollarSign } from 'lucide-react'

export default function EarningsView() {
  const totalEarnings = '12.5 ETH'
  const monthlyEarnings = '2.3 ETH'
  const pendingPayout = '1.8 ETH'

  const earningsData = [
    { date: '2024-02-01', track: 'Neon Dreams', amount: '0.8 ETH', royalties: 12 },
    { date: '2024-02-02', track: 'Cyber Pulse', amount: '0.5 ETH', royalties: 8 },
    { date: '2024-02-03', track: 'Digital Echo', amount: '1.2 ETH', royalties: 15 },
    { date: '2024-02-04', track: 'Synth Wave', amount: '0.3 ETH', royalties: 4 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Earnings</h2>
        <p className="text-white/60">Track your revenue from music NFT sales and royalties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="border border-white/[0.08] rounded-lg p-6"
          style={{ backgroundColor: 'rgba(13, 13, 18, 0.5)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">Total Earnings</h3>
            <DollarSign size={16} className="text-[#FF1F8A]" />
          </div>
          <p className="text-2xl font-bold">{totalEarnings}</p>
          <p className="text-white/40 text-xs mt-2">All time</p>
        </div>

        <div
          className="border border-white/[0.08] rounded-lg p-6"
          style={{ backgroundColor: 'rgba(13, 13, 18, 0.5)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">This Month</h3>
            <Calendar size={16} className="text-[#B794F4]" />
          </div>
          <p className="text-2xl font-bold">{monthlyEarnings}</p>
          <p className="text-white/40 text-xs mt-2">Feb 2024</p>
        </div>

        <div
          className="border border-white/[0.08] rounded-lg p-6"
          style={{ backgroundColor: 'rgba(13, 13, 18, 0.5)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">Pending Payout</h3>
            <TrendingUp size={16} className="text-[#B794F4]" />
          </div>
          <p className="text-2xl font-bold">{pendingPayout}</p>
          <p className="text-white/40 text-xs mt-2">Ready to claim</p>
        </div>
      </div>

      {/* Earnings History */}
      <div
        className="border border-white/[0.08] rounded-lg overflow-hidden"
        style={{ backgroundColor: 'rgba(13, 13, 18, 0.3)' }}
      >
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="font-semibold">Recent Earnings</h3>
        </div>

        <div className="divide-y divide-white/[0.08]">
          {earningsData.map((entry, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
              <div className="flex-1">
                <p className="font-medium">{entry.track}</p>
                <p className="text-xs text-white/40">{entry.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#FF1F8A]">{entry.amount}</p>
                <p className="text-xs text-white/40">{entry.royalties} sales</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Button */}
      <button
        className="w-full py-3 rounded-lg font-semibold transition"
        style={{ backgroundColor: '#FF1F8A', color: 'white' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E01A73')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF1F8A')}
      >
        Claim Earnings
      </button>
    </div>
  )
}
