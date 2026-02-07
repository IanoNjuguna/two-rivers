'use client'

import React, { useState } from 'react'
import { IconMenu2 as Menu, IconHome as HomeIcon, IconBooks as Library, IconSearch as Search, IconCurrencyDollar as DollarSign, IconTrendingUp as TrendingUp, IconUser as User, IconLogout as LogOut, IconPlus, IconMusic as Music, IconCopy } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import MarketplaceGrid from '@/components/MarketplaceGrid'
import MyStudioGrid from '@/components/MyStudioGrid'
import ConnectHeader from '@/components/ConnectHeader'
import EarningsView from '@/components/EarningsView'
import AudioPlayer from '@/components/AudioPlayer'
import Footer from '@/components/Footer'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'

const mockSongs = [
  {
    id: 1,
    title: 'Neon Dreams',
    creator: '0x1234...5678',
    price: '0.5',
    cover: '#FF1F8A',
    collaborators: 2,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Cyber Pulse',
    creator: '0x2345...6789',
    price: '0.75',
    cover: '#B794F4',
    collaborators: 1,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'Digital Echo',
    creator: '0x3456...7890',
    price: '1.0',
    cover: '#FF1F8A',
    collaborators: 3,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 4,
    title: 'Synth Wave',
    creator: '0x4567...8901',
    price: '0.3',
    cover: '#B794F4',
    collaborators: 0,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
]

const mockOwnedNFTs = [
  {
    id: 101,
    title: 'My First Track',
    creator: 'You',
    earnings: '2.5',
    cover: '#FF1F8A',
  },
  {
    id: 102,
    title: 'Collab Session',
    creator: 'You + 1',
    earnings: '1.8',
    cover: '#B794F4',
  },
]

type ViewType = 'home' | 'library' | 'search' | 'upload' | 'profile' | 'earnings' | 'analytics'

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('home')
  const [creatorMenuOpen, setCreatorMenuOpen] = useState(false)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const playerState = useAudioPlayer()

  const handlePlayTrack = (track: typeof mockSongs[0]) => {
    if (playerState.audioRef.current) {
      playerState.audioRef.current.src = track.url || ''
    }
    playerState.play(track, mockSongs)
  }

  return (
    <div style={{ backgroundColor: '#0D0D12' }} className="min-h-screen text-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08]" style={{ backgroundColor: 'rgba(13, 13, 18, 0.95)', backdropFilter: 'blur(16px)' }}>
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FF1F8A' }} />
            <span className="font-bold text-lg">Music NFT</span>
          </div>

          {/* Desktop Connect Header */}
          <div className="hidden lg:block">
            <ConnectHeader isConnected={isConnected} onConnect={() => setIsConnected(true)} />
          </div>

          {/* Mobile/Tablet Controls */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Hamburger Menu - Only show when connected */}
            {isConnected && (
              <button
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className="p-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
              >
                <Menu size={24} />
              </button>
            )}
            {/* Mobile Connect Header */}
            <ConnectHeader isConnected={isConnected} onConnect={() => setIsConnected(true)} />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {headerMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40" style={{ backgroundColor: '#0D0D12' }}>
          <nav className="flex flex-col p-4 space-y-2 h-full overflow-y-auto">
            <div className="px-0 py-2">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            <button
              onClick={() => {
                setCurrentView('home')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <HomeIcon size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('library')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Library size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Library</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('search')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Search size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Search</span>
            </button>

            <div className="border-t border-white/[0.08]" />

            <div className="px-0 py-2">
              <h2 className="text-xs font-semibold text-[#B794F4] uppercase tracking-wider">Creator</h2>
            </div>

            <button
              onClick={() => {
                setCurrentView('upload')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Music size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">Upload</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('earnings')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <DollarSign size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Earnings</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('analytics')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <TrendingUp size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Analytics</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('profile')
                setHeaderMenuOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <User size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            {isConnected && (
              <>
            <div className="border-t border-white/[0.08]" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/[0.12] text-white hover:bg-white/[0.05] bg-transparent"
                  onClick={() => {
                    setIsConnected(false)
                    setHeaderMenuOpen(false)
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Disconnect
                </Button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row flex-1 mt-16">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-white/[0.08] flex-col" style={{ backgroundColor: 'rgba(13, 13, 18, 0.5)' }}>
          <nav className="flex flex-col p-4 overflow-y-auto flex-1 space-y-1">
            <div className="px-0 pt-0 pb-3 mb-1">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <HomeIcon size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => setCurrentView('library')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Library size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Library</span>
            </button>
            <button
              onClick={() => setCurrentView('search')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Search size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Search</span>
            </button>

            <div className="border-t border-white/[0.08] my-2" />

            <div className="px-0 py-3 mb-1">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider">Creator</h2>
            </div>

            <button
              onClick={() => setCurrentView('upload')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Music size={18} className="text-[#FF1F8A] flex-shrink-0" />
              <span className="text-sm font-medium">Upload</span>
            </button>
            <button
              onClick={() => setCurrentView('earnings')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <DollarSign size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Earnings</span>
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <TrendingUp size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Analytics</span>
            </button>

            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <User size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Profile</span>
            </button>
          </nav>

          {/* Disconnect Button - Above scrollable nav */}
          {isConnected && (
            <div className="border-t border-white/[0.08] p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/[0.12] text-white hover:bg-white/[0.05] bg-transparent"
                onClick={() => setIsConnected(false)}
              >
                <LogOut size={16} className="mr-2" />
                Disconnect
              </Button>
            </div>
          )}

          <div className="border-t border-white/[0.08]" />

          {/* Footer Section */}
          <div className="p-4">
            <Footer />
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-80 lg:pb-0">
          <div className="p-6 max-w-7xl mx-auto">
            {currentView === 'home' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Discover Music</h2>
                </div>
                <MarketplaceGrid songs={mockSongs} isConnected={isConnected} onPlay={handlePlayTrack} />
              </div>
            )}

            {currentView === 'library' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">My Library</h2>
                  <p className="text-white/60">
                    Your saved tracks and NFTs
                  </p>
                </div>
                {isConnected ? (
                  <MyStudioGrid nfts={mockOwnedNFTs} />
                ) : (
                  <div className="p-12 text-center rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Library className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(183, 148, 244, 0.4)' }} />
                    <h3 className="text-xl font-semibold mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-white/60">
                      Connect your wallet to view your library
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentView === 'search' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Search</h2>
                  <p className="text-white/60">
                    Find artists, tracks, and collections
                  </p>
                </div>
                <div className="p-12 text-center rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(183, 148, 244, 0.4)' }} />
                  <h3 className="text-xl font-semibold mb-2">
                    Search Coming Soon
                  </h3>
                  <p className="text-white/60">
                    Advanced search functionality will be available soon
                  </p>
                </div>
              </div>
            )}

            {currentView === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Upload Track</h2>
                  <p className="text-white/60">
                    Create and mint your own music NFT
                  </p>
                </div>
                {isConnected ? (
                  <div className="border border-white/[0.08] rounded-xl p-12 text-center" style={{ backgroundColor: 'rgba(13, 13, 18, 0.3)' }}>
                    <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: 'rgba(255, 31, 138, 0.1)' }}>
                      <div className="w-full h-full flex items-center justify-center text-[#FF1F8A]">
                        <Music size={32} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Upload Your Track
                    </h3>
                    <p className="text-white/60 mb-6">
                      Drag and drop your audio file or click to browse
                    </p>
                    <Button className="bg-[#FF1F8A] hover:bg-[#E01A73] text-white">
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="border border-white/[0.08] rounded-xl p-12 text-center" style={{ backgroundColor: 'rgba(13, 13, 18, 0.3)' }}>
                    <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: 'rgba(183, 148, 244, 0.1)' }}>
                      <div className="w-full h-full flex items-center justify-center text-[#B794F4]">
                        <Music size={32} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-white/60">
                      Connect your wallet to upload tracks
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentView === 'earnings' && (
              <EarningsView isConnected={isConnected} />
            )}

            {currentView === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analytics</h2>
                  <p className="text-white/60">
                    View detailed insights about your music performance
                  </p>
                </div>
                <div className="border border-white/[0.08] rounded-xl p-12 text-center" style={{ backgroundColor: 'rgba(13, 13, 18, 0.3)' }}>
                  <div className="w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: 'rgba(183, 148, 244, 0.1)' }}>
                    <div className="w-full h-full flex items-center justify-center text-[#B794F4]">
                      <Music size={32} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-white/60">
                    Track plays, revenue, and listener insights
                  </p>
                </div>
              </div>
            )}

            {currentView === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Profile</h2>
                  <p className="text-white/60">
                    Manage your account and settings
                  </p>
                </div>
                {isConnected ? (
                  <div className="p-8 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF1F8A] to-[#B794F4]" />
                      <div>
                        <h3 className="text-lg font-semibold">Your Profile</h3>
                        <p className="text-white/60 text-sm">Connected wallet</p>
                      </div>
                    </div>
                    
                    {/* Wallet Address Display */}
                    <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
                      <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">0x1234...5678</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('0x1234...5678')
                          }}
                          className="p-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
                          title="Copy wallet address"
                        >
                          <IconCopy size={16} />
                        </button>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="border-white/[0.12] text-white hover:bg-white/[0.05] w-full bg-transparent"
                      onClick={() => setIsConnected(false)}
                    >
                      <LogOut size={16} className="mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <User className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(183, 148, 244, 0.4)' }} />
                    <h3 className="text-xl font-semibold mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-white/60">
                      Sign in to view your profile
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Audio Player */}
        <AudioPlayer playerState={playerState} />

        {/* Mobile-only Footer */}
        <footer className="lg:hidden px-4 py-6">
          <Footer />
        </footer>
      </div>
    </div>
  )
}
