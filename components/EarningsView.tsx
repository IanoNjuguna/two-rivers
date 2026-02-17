'use client'

import { Calendar } from "@/components/ui/calendar"
import { IconTrendingUp, IconCalendar, IconCurrencyDollar as DollarSign } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'

interface EarningsViewProps {
  isConnected: boolean
}

export default function EarningsView({ isConnected }: EarningsViewProps) {
  const t = useTranslations('earnings')

  const totalEarnings = '12.5 ETH'
  const monthlyEarnings = '2.3 ETH'
  const pendingPayout = '1.8 ETH'

  const earningsData = [
    { date: '2024-02-01', track: 'Neon Dreams', amount: '0.8 ETH', royalties: 12 },
    { date: '2024-02-02', track: 'Cyber Pulse', amount: '0.5 ETH', royalties: 8 },
    { date: '2024-02-03', track: 'Digital Echo', amount: '1.2 ETH', royalties: 15 },
    { date: '2024-02-04', track: 'Synth Wave', amount: '0.3 ETH', royalties: 4 },
  ]

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
          <p className="text-white/60">{t('subtitle')}</p>
        </div>
        <div
          className="border border-white/[0.08] rounded-lg p-12 text-center bg-dark-primary-30"
        >
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-lavender-10">
            <div className="w-full h-full flex items-center justify-center text-[#B794F4]">
              <DollarSign size={32} />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('signInToView')}</h3>
          <p className="text-white/60">{t('connectToSee')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-white/60">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-white/[0.08] rounded-lg p-6 bg-dark-primary-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">{t('totalEarnings')}</h3>
            <DollarSign size={16} className="text-[#FF1F8A]" />
          </div>
          <p className="text-2xl font-bold">{totalEarnings}</p>
          <p className="text-white/40 text-xs mt-2">{t('allTime')}</p>
        </div>

        <div className="border border-white/[0.08] rounded-lg p-6 bg-dark-primary-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">{t('thisMonth')}</h3>
            <Calendar size={16} className="text-[#B794F4]" />
          </div>
          <p className="text-2xl font-bold">{monthlyEarnings}</p>
          <p className="text-white/40 text-xs mt-2">Feb 2024</p>
        </div>

        <div className="border border-white/[0.08] rounded-lg p-6 bg-dark-primary-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">{t('pendingPayout')}</h3>
            <IconTrendingUp size={16} className="text-[#B794F4]" />
          </div>
          <p className="text-2xl font-bold">{pendingPayout}</p>
          <p className="text-white/40 text-xs mt-2">{t('readyToClaim')}</p>
        </div>
      </div>

      {/* Earnings History */}
      <div
        className="border border-white/[0.08] rounded-lg overflow-hidden bg-dark-primary-30"
      >
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="font-semibold">{t('recentEarnings')}</h3>
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
                <p className="text-xs text-white/40">{t('sales', { count: entry.royalties })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Button */}
      <button className="w-full py-3 rounded-lg font-semibold transition bg-[#FF1F8A] text-white hover:bg-[#E01A73]">
        {t('claimEarnings')}
      </button>
    </div>
  )
}
