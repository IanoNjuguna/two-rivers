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
  const [uploadMode, setUploadMode] = useState<'single' | 'album'>('single')
  const [albumTracks, setAlbumTracks] = useState<Array<{ id: string; title: string; file?: File }>>([])
  const playerState = useAudioPlayer()

  const handlePlayTrack = (track: typeof mockSongs[0]) => {
    if (playerState.audioRef.current) {
      playerState.audioRef.current.src = track.url || ''
    }
    playerState.play(track, mockSongs)
  }

  return (
    <div className="min-h-screen text-white flex flex-col bg-dark-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/[0.08] bg-dark-primary-95 backdrop-blur-16">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="doba logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-lg tracking-wide tracking-wider-custom">doba</span>
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
                aria-label="Toggle menu"
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
        <div className="lg:hidden fixed inset-0 top-16 z-40 animate-slide-in-down bg-dark-primary">
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
        <aside className="hidden lg:flex w-64 border-r border-white/[0.08] flex-col bg-dark-primary-50">
          <nav className="flex flex-col p-4 overflow-y-auto flex-1 space-y-1">
            <div className="px-0 pt-0 pb-0 mb-1">
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

            <div className="px-0 pt-3 pb-0 mb-1">
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
              <div className="space-y-6 animate-fade-in">
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
                  <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                    <Library className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
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
                <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                  <Search className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
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
                  <h2 className="text-2xl font-bold mb-2">Upload Music</h2>
                  <p className="text-white/60">
                    Create and mint your own music NFT
                  </p>
                </div>

                {isConnected ? (
                  <>
                    {/* Upload Mode Tabs */}
                    <div className="flex gap-2 border-b border-white/[0.08]">
                      <button
                        onClick={() => {
                          setUploadMode('single')
                          setAlbumTracks([])
                        }}
                        className={`px-4 py-3 font-medium text-sm transition ${
                          uploadMode === 'single'
                            ? 'text-[#FF1F8A] border-b-2 border-[#FF1F8A]'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Single Track
                      </button>
                      <button
                        onClick={() => setUploadMode('album')}
                        className={`px-4 py-3 font-medium text-sm transition ${
                          uploadMode === 'album'
                            ? 'text-[#FF1F8A] border-b-2 border-[#FF1F8A]'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Album
                      </button>
                    </div>

                    {/* Single Track Upload */}
                    {uploadMode === 'single' && (
                      <div className="border border-white/[0.08] p-12 text-center bg-dark-primary-30">
                        <div className="w-16 h-16 mx-auto mb-4 bg-pink-10">
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
                    )}

                    {/* Album Upload */}
                    {uploadMode === 'album' && (
                      <div className="space-y-6">
                        <div className="border border-white/[0.08] p-12 text-center bg-dark-primary-30">
                          <div className="w-16 h-16 mx-auto mb-4 bg-pink-10">
                            <div className="w-full h-full flex items-center justify-center text-[#FF1F8A]">
                              <Music size={32} />
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            Create Album
                          </h3>
                          <p className="text-white/60 mb-6">
                            Add multiple tracks to create an album
                          </p>
                          <Button 
                            onClick={() => {
                              const newId = `track-${Date.now()}`
                              setAlbumTracks([...albumTracks, { id: newId, title: '' }])
                            }}
                            className="bg-[#FF1F8A] hover:bg-[#E01A73] text-white"
                          >
                            <IconPlus size={16} className="mr-2" />
                            Add First Track
                          </Button>
                        </div>

                        {/* Album Tracks List */}
                        {albumTracks.length > 0 && (
                          <div className="space-y-4">
                            <h3 className="font-semibold">Tracks ({albumTracks.length})</h3>
                            {albumTracks.map((track, index) => (
                              <div key={track.id} className="border border-white/[0.08] p-4 bg-dark-primary-30">
                                <div className="flex items-center gap-4">
                                  <span className="text-white/60 text-sm w-8">{index + 1}.</span>
                                  <input
                                    type="text"
                                    placeholder={`Track ${index + 1} Title`}
                                    value={track.title}
                                    onChange={(e) => {
                                      const updated = [...albumTracks]
                                      updated[index].title = e.target.value
                                      setAlbumTracks(updated)
                                    }}
                                    className="flex-1 bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/[0.12]"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setAlbumTracks(albumTracks.filter((_, i) => i !== index))
                                    }}
                                    className="border-white/[0.12] text-white/70 hover:text-white hover:bg-white/[0.05] bg-transparent"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button 
                              onClick={() => {
                                const newId = `track-${Date.now()}`
                                setAlbumTracks([...albumTracks, { id: newId, title: '' }])
                              }}
                              className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08]"
                            >
                              <IconPlus size={16} className="mr-2" />
                              Add Track
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="border border-white/[0.08] p-12 text-center bg-dark-primary-30">
                    <div className="w-16 h-16 mx-auto mb-4 bg-lavender-10">
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
                <div className="border border-white/[0.08] rounded-xl p-12 text-center bg-dark-primary-30">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-lavender-10">
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
                  <div className="p-8 rounded-xl bg-white-2 border border-white/[0.08]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF1F8A] to-[#B794F4]" />
                      <div>
                        <h3 className="text-lg font-semibold">Your Profile</h3>
                        <p className="text-white/60 text-sm">Connected wallet</p>
                      </div>
                    </div>
                    
                    {/* Wallet Address Display */}
                    <div className="mb-6 p-4 rounded-lg bg-white-4">
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
                  <div className="p-12 text-center rounded-xl bg-white-2 border border-white/[0.08]">
                    <User className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
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
