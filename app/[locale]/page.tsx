'use client'

import React, { useState, useEffect } from 'react'
import { IconMenu2 as Menu, IconHome as HomeIcon, IconPlaylistAdd as Library, IconSearch as Search, IconCurrencyDollar as DollarSign, IconTrendingUp as TrendingUp, IconUser as User, IconLogout as LogOut, IconPlus, IconMusic as Music, IconCopy, IconArrowsExchange } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import MarketplaceGrid from '@/components/MarketplaceGrid'
import MyStudioGrid from '@/components/MyStudioGrid'
import ConnectHeader from '@/components/ConnectHeader'
import EarningsView from '@/components/EarningsView'
import AudioPlayer from '@/components/AudioPlayer'
import NowPlayingSidebar from '@/components/NowPlayingSidebar'
import Footer from '@/components/Footer'
import UploadView from '@/components/UploadView'
import { usePrivy } from '@privy-io/react-auth'
import { getAddressesForChain, CONTRACT_ADDRESS } from "@/lib/web3"
import { useTranslations } from 'next-intl'
import { useAudio } from '@/components/AudioProvider'
import { ProfileEditor } from '@/components/ProfileEditor'
import { SendFunds } from '@/components/SendFunds'
import DepositView from '@/components/DepositView'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useAccount as useWagmiAccount, useDisconnect } from 'wagmi'
import { sdk } from "@farcaster/miniapp-sdk"
import { useBackendAuth } from '@/hooks/useBackendAuth'

const formatAddress = (address: string, startChars: number = 10, endChars: number = 9): string => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
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

  const { logout: privyLogout, authenticated } = usePrivy()
  const { disconnect } = useDisconnect()
  const { logout: backendLogout } = useBackendAuth()
  const {
    playerState,
    handlePlayTrack,
    effectiveAddress,
    isConnected: isPlayerConnected,
    isAuthenticated,
    sidebarTrack,
    isSidebarOpen,
    handleOpenSidebar,
    toggleSidebar
  } = useAudio()

  const handleLogout = React.useCallback(async () => {
    try {
      // 1. Backend Logout (Clear JWT)
      backendLogout()

      // 2. Privy Logout
      await privyLogout()

      // 3. Wagmi Disconnect
      disconnect()

      // 4. Close Farcaster Mini App if applicable
      const isMini = await sdk.isInMiniApp()
      if (isMini) {
        sdk.actions.close()
      }

      // 5. Reset View
      setCurrentView('home')
    } catch (e) {
      console.error('Logout failed', e)
      // Fallback reset
      setCurrentView('home')
    }
  }, [privyLogout, disconnect, backendLogout])

  const tNav = useTranslations('nav')
  const tHome = useTranslations('home')
  const tLibrary = useTranslations('library')
  const tSearch = useTranslations('search')
  const tUpload = useTranslations('upload')
  const tAnalytics = useTranslations('analytics')
  const tProfile = useTranslations('profile')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [selectedChain, setSelectedChain] = useState('All')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const GENRES = ["All", "Afrobeat", "AfroHouse", "Alternative", "Ambient", "Blues", "Classical", "Country", "Dancehall", "Disco", "EDM", "Electronic", "Folk", "Funk", "Hip Hop", "House", "Indie", "Jazz", "Latin", "Lo-Fi", "Pop", "R&B", "Rap", "Reggae", "Rock", "Soul", "Techno", "Trap"]
  const CHAINS = [
    { id: 'All', label: 'All Chains', logo: null },
    { id: '42161', label: 'Arbitrum', logo: '/images/arbitrum.png' },
    { id: '8453', label: 'Base', logo: '/images/base.png' }
  ]

  // handlePlayTrack is now provided by AudioProvider

  return (
    <div className="h-screen text-white flex flex-col bg-[#0D0D12]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-[rgba(13,13,18,0.95)] backdrop-blur-md">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="doba logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-wide tracking-wider">doba</span>
          </div>

          {/* Desktop Connect Header & Chain Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <ConnectHeader
              address={effectiveAddress || undefined}
              logout={handleLogout}
            />
          </div>

          {/* Mobile/Tablet Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <ConnectHeader
              address={effectiveAddress || undefined}
              logout={handleLogout}
            />
            {/* Hamburger Menu - Only show when authenticated */}
            {authenticated && (
              <button
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className="p-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
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
      <div className="flex flex-col lg:flex-row flex-1 mt-16 lg:overflow-hidden">
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
        <div className="flex-1 flex flex-row min-w-0 relative lg:min-h-0">
          <main className="flex-1 overflow-y-auto outline-none lg:h-full">
            <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
              {currentView === 'home' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{tHome('discoverMusic')}</h2>
                  </div>
                  <MarketplaceGrid
                    isSidebarOpen={isSidebarOpen}
                    currentTrackId={playerState.currentTrack?.id}
                    isPlaying={playerState.isPlaying}
                    onPlay={(track, tracks) => handlePlayTrack({
                      id: track.token_id,
                      title: track.name,
                      creator: track.artist,
                      cover: track.image_url,
                      url: track.streaming_url || track.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                      collaborators: 0,
                      price: track.price
                    }, tracks.map(t => ({
                      id: t.token_id,
                      title: t.name,
                      creator: t.artist,
                      cover: t.image_url,
                      url: t.streaming_url || t.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
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
                        url: track.streaming_url || track.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                        collaborators: 0,
                        price: track.price
                      }, tracks.map(t => ({
                        id: t.token_id,
                        title: t.name,
                        creator: t.artist,
                        cover: t.image_url,
                        url: t.streaming_url || t.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
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
                <div className="space-y-8 animate-fade-in pb-20">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{tSearch('title')}</h2>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="relative group flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyber-pink transition-colors" size={20} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="I want to listen to ..."
                          className="w-full bg-white/5 border border-white/10 rounded-none pl-12 pr-4 py-[14px] text-white focus:outline-none focus:border-cyber-pink focus:ring-1 focus:ring-cyber-pink/50 transition-all placeholder:text-white/20 text-lg"
                        />
                      </div>
                      <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                        <SelectTrigger className="w-full md:w-[180px] bg-white/5 border border-white/10 rounded-none h-auto py-4 font-bold uppercase tracking-widest text-[10px] text-white/60 focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A22] border-white/10 rounded-none text-white/80">
                          {GENRES.map((g) => (
                            <SelectItem key={g} value={g} className="font-bold uppercase tracking-widest text-[10px] focus:bg-white/10 focus:text-white">
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                  </div>

                  <MarketplaceGrid
                    isSidebarOpen={isSidebarOpen}
                    searchQuery={debouncedSearch}
                    genre={selectedGenre}
                    chainId={selectedChain}
                    currentTrackId={playerState.currentTrack?.id}
                    isPlaying={playerState.isPlaying}
                    onPlay={(track, tracks) => handlePlayTrack({
                      ...track,
                      id: track.token_id,
                      title: track.name,
                      creator: track.artist,
                      cover: track.image_url,
                      url: track.streaming_url || track.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                      collaborators: 0,
                    }, tracks.map(t => ({
                      ...t,
                      id: t.token_id,
                      title: t.name,
                      creator: t.artist,
                      cover: t.image_url,
                      url: t.streaming_url || t.audio_url.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
                      collaborators: 0,
                    })))}
                  />
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
                      logout={handleLogout}
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

          {/* Right Sidebar */}
          <NowPlayingSidebar
            track={sidebarTrack}
            isVisible={isSidebarOpen}
            onClose={toggleSidebar}
          />
        </div>
      </div>
      {/* Audio Player Footer */}
      {playerState.currentTrack && (
        <AudioPlayer playerState={playerState} />
      )}
    </div>
  )
}
