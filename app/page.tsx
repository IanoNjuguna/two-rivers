'use client'

import React, { useState } from 'react'
import { Menu, Home, Library, Search, DollarSign, TrendingUp, User, LogOut, Plus, Music } from 'lucide-react'
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
      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-white/[0.08] fixed left-0 top-16 h-[calc(100vh-64px)] flex-col" style={{ backgroundColor: 'rgba(13, 13, 18, 0.5)' }}>
          <nav className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
            <div className="px-4 py-2 mb-1">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <Home size={18} className="text-[#FF1F8A] flex-shrink-0" />
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

            {/* Creator Menu - Desktop */}
            <div className="border-t border-white/[0.08] mt-2 pt-2">
              <div className="px-4 py-2 mb-1">
                <h2 className="text-xs font-semibold text-[#B794F4] uppercase tracking-wider">Creator</h2>
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
            </div>

            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
            >
              <User size={18} className="text-[#B794F4] flex-shrink-0" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            {isConnected && (
              <button
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition text-white/70 hover:text-white hover:bg-white/[0.05]"
                onClick={() => setIsConnected(false)}
              >
                <LogOut size={16} className="text-[#B794F4] flex-shrink-0" />
                <span className="text-sm font-medium">Profile</span>
              </button>
            )}
          </nav>

          {/* Disconnect and Footer - Below scrollable nav */}
          {isConnected && (
            <div className="border-t border-white/[0.08] p-4 space-y-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/[0.12] text-white hover:bg-white/[0.05] bg-transparent"
                onClick={() => setIsConnected(false)}
              >
                <LogOut size={16} className="mr-2" />
                Disconnect
              </Button>
              <Footer />
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto lg:ml-64 pb-48 lg:pb-0">
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
              <EarningsView />
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

        {/* Footer for disconnected users */}
        {!isConnected && (
          <div className="px-6 py-8 border-t border-white/[0.08]">
            <Footer />
          </div>
        )}
      </div>

      {/* Audio Player */}
      <AudioPlayer playerState={playerState} />
    </div>
  )
}
