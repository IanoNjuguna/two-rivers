'use client'

import React, { useState, useEffect } from 'react'
import { IconMenu2 as Menu, IconHome as HomeIcon, IconBooks as Library, IconSearch as Search, IconCurrencyDollar as DollarSign, IconTrendingUp as TrendingUp, IconUser as User, IconLogout as LogOut, IconPlus, IconMusic as Music, IconCopy, IconArrowsExchange, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import MarketplaceGrid from '@/components/MarketplaceGrid'
import MyStudioGrid from '@/components/MyStudioGrid'
import ConnectHeader from '@/components/ConnectHeader'
import EarningsView from '@/components/EarningsView'
import AudioPlayer from '@/components/AudioPlayer'
import Footer from '@/components/Footer'
import UploadView from '@/components/UploadView'
import { usePrivy } from '@privy-io/react-auth'
import { getAddressesForChain, CONTRACT_ADDRESS } from "@/lib/web3"
import { useTranslations } from 'next-intl'
import { useAudio } from '@/components/AudioProvider'
import { ProfileEditor } from '@/components/ProfileEditor'
import { SendFunds } from '@/components/SendFunds'
import DepositView from '@/components/DepositView'

import { useAccount as useWagmiAccount } from 'wagmi'
import { sdk } from "@farcaster/miniapp-sdk"

const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

function AddressPill({ address }: { address: string }) {
  const [copied, setCopied] = React.useState(false)
  const short = formatAddress(address)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 transition-all group">
      <span className="text-xs font-mono text-white/70 group-hover:text-white/90 transition-colors select-all">
        {short}
      </span>
      <button
        onClick={handleCopy}
        className="p-0.5 rounded text-white/40 hover:text-white/80 transition-colors"
        title="Copy address"
      >
        {copied
          ? <IconCheck size={13} className="text-green-400" />
          : <IconCopy size={13} />}
      </button>
      <a
        href={`https://basescan.org/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-0.5 rounded text-white/40 hover:text-white/80 transition-colors"
        title="View on Basescan"
      >
        <IconExternalLink size={13} />
      </a>
    </div>
  )
}

type ViewType = 'home' | 'library' | 'search' | 'upload' | 'profile' | 'earnings' | 'analytics' | 'send-money' | 'deposit'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    sdk.isInMiniApp()
      .then(res => {
        if (res) {
          // Ensure ready is called when we know we're rendering a Mini App Dashboard
          setTimeout(() => sdk.actions.ready(), 100)
        }
      })
      .catch(() => { })
      .finally(() => setMounted(true))
  }, [])

  if (!mounted) return <div className="h-screen bg-[#0D0D12]" />

  return <DashboardLayout />
}

// ------------------------------------------------------------------------------------------------
// Shared UI Layout
// ------------------------------------------------------------------------------------------------
function DashboardLayout() {
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)

  const { logout, authenticated } = usePrivy()
  const { playerState, handlePlayTrack, effectiveAddress, isConnected: isPlayerConnected, isAuthenticated } = useAudio()

  const tNav = useTranslations('nav')
  const tHome = useTranslations('home')
  const tLibrary = useTranslations('library')
  const tSearch = useTranslations('search')
  const tUpload = useTranslations('upload')
  const tAnalytics = useTranslations('analytics')
  const tProfile = useTranslations('profile')

  // handlePlayTrack is now provided by AudioProvider

  return (
    <div className="h-screen overflow-hidden text-white flex flex-col bg-[#0D0D12]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-[rgba(13,13,18,0.95)] backdrop-blur-md">
        <div className="h-full px-4 lg:px-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          {/* Logo - Left */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="doba logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-wide tracking-wider">doba</span>
          </div>

          {/* Center - Address pill (desktop only) */}
          <div className="hidden lg:flex justify-center">
            {effectiveAddress && (
              <AddressPill address={effectiveAddress} />
            )}
          </div>

          {/* Right - Connect Header (Base icon) + Mobile controls */}
          <div className="flex items-center gap-2 justify-end">
            <ConnectHeader address={effectiveAddress || undefined} />
            {/* Hamburger Menu - Only show when connected on mobile */}
            {isPlayerConnected && (
              <button
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className="lg:hidden p-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {headerMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 animate-slide-in-down bg-midnight">
          <nav className="flex flex-col p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-2 h-full overflow-y-auto">
            <div className="px-0 py-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                {tNav('navigation')}
              </h2>
            </div>

            <button
              onClick={() => {
                setCurrentView('home')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <HomeIcon size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('home')}</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('library')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Library size={18} className="text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('library')}</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('search')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Search size={18} className="text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('search')}</span>
            </button>

            <div className="border-t border-white/[0.08]" />

            <div className="px-0 py-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                {tNav('creator')}
              </h2>
            </div>

            <button
              onClick={() => {
                setCurrentView('upload')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Music size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('upload')}</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('earnings')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <DollarSign size={18} className="text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('earnings')}</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('analytics')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <TrendingUp size={18} className="text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('analytics')}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('profile')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <User size={18} className="text-purple-400 flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('profile')}</span>
            </button>

            <div className="border-t border-white/[0.08]" />

            <div className="px-0 py-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B794F4]">
                {tNav('wallet')}
              </h2>
            </div>

            <button
              onClick={() => {
                setCurrentView('send-money')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <DollarSign size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('sendMoney')}</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('deposit')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <IconPlus size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('deposit')}</span>
            </button>
            {/* Sign Out removed from mobile menu - now in Profile */}
          </nav>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row flex-1 mt-16 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-white/[0.08] flex-col bg-[#0D0D12] overflow-y-auto">
          <nav className="flex flex-col p-4 overflow-y-auto flex-1 space-y-1">
            <div className="px-0 pt-0 pb-0 mb-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                {tNav('navigation')}
              </h2>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <HomeIcon size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('home')}</span>
            </button>
            <button
              onClick={() => setCurrentView('library')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Library size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('library')}</span>
            </button>
            <button
              onClick={() => setCurrentView('search')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Search size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('search')}</span>
            </button>

            <div className="border-t border-white/[0.08] my-2" />

            <div className="px-0 pt-3 pb-0 mb-1">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider" style={{ letterSpacing: '0.04em' }}>{tNav('creator')}</h2>
            </div>

            <button
              onClick={() => setCurrentView('upload')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Music size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('upload')}</span>
            </button>
            <button
              onClick={() => setCurrentView('earnings')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <DollarSign size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('earnings')}</span>
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <TrendingUp size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('analytics')}</span>
            </button>

            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <User size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('profile')}</span>
            </button>

            <div className="border-t border-white/[0.08] my-2" />

            <div className="px-0 pt-3 pb-0 mb-1">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider" style={{ letterSpacing: '0.04em' }}>{tNav('wallet')}</h2>
            </div>

            <button
              onClick={() => setCurrentView('send-money')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <DollarSign size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('sendMoney')}</span>
            </button>
            <button
              onClick={() => setCurrentView('deposit')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <IconPlus size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">{tNav('deposit')}</span>
            </button>

            {/* Sign Out removed from sidebar - now in Profile */}
          </nav>
        </aside>

        {/* Content Area wrapper */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          <main className={`flex-1 overflow-y-auto ${playerState.currentTrack ? 'pb-[90px]' : ''}`}>
            <div className="p-6 max-w-7xl mx-auto">
              {currentView === 'home' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{tHome('discoverMusic')}</h2>
                  </div>
                  <MarketplaceGrid
                    currentTrackId={playerState.currentTrack?.id}
                    isPlaying={playerState.isPlaying}
                    onPlay={(track, tracks) => handlePlayTrack({
                      id: track.token_id,
                      title: track.name,
                      creator: track.artist,
                      cover: track.image_url,
                      url: track.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                      collaborators: 0,
                      price: track.price
                    }, tracks.map(t => ({
                      id: t.token_id,
                      title: t.name,
                      creator: t.artist,
                      cover: t.image_url,
                      url: t.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                      collaborators: 0,
                      price: t.price
                    })))} />
                </div>
              )}


              {currentView === 'library' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{tLibrary('title')}</h2>
                    <p className="text-white/60">
                      {tLibrary('subtitle')}
                    </p>
                  </div>
                  {isPlayerConnected ? (
                    <MyStudioGrid
                      address={effectiveAddress || undefined}
                      currentTrackId={playerState.currentTrack?.id}
                      isPlaying={playerState.isPlaying}
                      onPlay={(track, tracks) => handlePlayTrack({
                        id: track.token_id,
                        title: track.name,
                        creator: track.artist,
                        cover: track.image_url,
                        url: track.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                        collaborators: 0,
                        price: track.price
                      }, tracks.map(t => ({
                        id: t.token_id,
                        title: t.name,
                        creator: t.artist,
                        cover: t.image_url,
                        url: t.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                        collaborators: 0,
                        price: t.price
                      })))}
                    />
                  ) : (
                    <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                      <Library className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
                      <h3 className="text-xl font-semibold mb-2">
                        {tLibrary('connectWallet')}
                      </h3>
                      <p className="text-white/60">
                        {tLibrary('connectToView')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'search' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{tSearch('title')}</h2>
                    <p className="text-white/60">
                      {tSearch('subtitle')}
                    </p>
                  </div>
                  <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                    <Search className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
                    <h3 className="text-xl font-semibold mb-2">
                      {tSearch('comingSoon')}
                    </h3>
                    <p className="text-white/60">
                      {tSearch('comingSoonDesc')}
                    </p>
                  </div>
                </div>
              )}

              {currentView === 'upload' && (
                isAuthenticated ? (
                  <UploadView />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{tUpload('title')}</h2>
                      <p className="text-white/60">
                        {tUpload('subtitle')}
                      </p>
                    </div>
                    <div className="border border-white/[0.08] p-12 text-center bg-[rgba(13,13,18,0.3)]">
                      <div className="w-16 h-16 mx-auto mb-4 bg-[rgba(183,148,244,0.1)]">
                        <div className="w-full h-full flex items-center justify-center text-[#B794F4]">
                          <Music size={32} />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {tUpload('connectWallet')}
                      </h3>
                      <p className="text-white/60">
                        {tUpload('connectToUpload')}
                      </p>
                    </div>
                  </div>
                )
              )}

              {currentView === 'earnings' && (
                <EarningsView />
              )}

              {currentView === 'analytics' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{tAnalytics('title')}</h2>
                    <p className="text-white/60">
                      {tAnalytics('subtitle')}
                    </p>
                  </div>
                  <div className="border border-white/[0.08] rounded-xl p-12 text-center bg-[rgba(13,13,18,0.3)]">
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-[rgba(183,148,244,0.1)]">
                      <div className="w-full h-full flex items-center justify-center text-[#B794F4]">
                        <Music size={32} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {tAnalytics('comingSoon')}
                    </h3>
                    <p className="text-white/60">
                      {tAnalytics('comingSoonDesc')}
                    </p>
                  </div>
                </div>
              )}

              {currentView === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{tProfile('title')}</h2>
                    <p className="text-white/60">
                      {tProfile('subtitle')}
                    </p>
                  </div>
                  {isAuthenticated && effectiveAddress ? (
                    <ProfileEditor
                      address={effectiveAddress}
                      tProfile={tProfile}
                      logout={logout}
                    />
                  ) : (
                    <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                      <User className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
                      <h3 className="text-xl font-semibold mb-2">
                        {tProfile('connectWallet')}
                      </h3>
                      <p className="text-white/60">
                        {tProfile('signInToView')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'send-money' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{tNav('sendMoneyOnBase')}</h2>
                  </div>
                  {isPlayerConnected ? (
                    <SendFunds />
                  ) : (
                    <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
                      <h3 className="text-xl font-semibold mb-2">
                        {tNav('connectWallet')}
                      </h3>
                      <p className="text-white/60">
                        {tProfile('signInToView')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentView === 'deposit' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-1">{tNav('depositOnBase')}</h2>
                    <p className="text-white/60 text-xs">{tNav('depositDesc')}</p>
                  </div>
                  <DepositView />
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/[0.08] mt-12 py-10 flex justify-center">
              <Footer />
            </footer>
          </main>

          {/* Audio Player constrained to content area */}
          <AudioPlayer playerState={playerState} />
        </div>
      </div>
    </div>
  )
}
