'use client'

import React, { useState } from 'react'
import { Music, Home, Library, Search, Upload, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MarketplaceGrid from '@/components/MarketplaceGrid'
import MyStudioGrid from '@/components/MyStudioGrid'
import ConnectHeader from '@/components/ConnectHeader'

const mockSongs = [
  {
    id: 1,
    title: 'Neon Dreams',
    creator: '0x1234...5678',
    price: '0.5',
    cover: '#FF1F8A',
    collaborators: 2,
  },
  {
    id: 2,
    title: 'Cyber Pulse',
    creator: '0x2345...6789',
    price: '0.75',
    cover: '#B794F4',
    collaborators: 1,
  },
  {
    id: 3,
    title: 'Digital Echo',
    creator: '0x3456...7890',
    price: '1.0',
    cover: '#FF1F8A',
    collaborators: 3,
  },
  {
    id: 4,
    title: 'Synth Wave',
    creator: '0x4567...8901',
    price: '0.3',
    cover: '#B794F4',
    collaborators: 0,
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

type ViewType = 'home' | 'library' | 'search' | 'upload' | 'profile'

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('home')

  return (
    <div style={{ backgroundColor: '#0D0D12' }} className="min-h-screen text-white flex flex-col">
      {/* Header - Desktop Only */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] backdrop-blur-md" style={{ backgroundColor: 'rgba(13, 13, 18, 0.8)' }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#FF1F8A] to-[#B794F4] flex items-center justify-center">
              <Music size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">Music NFT</h1>
          </div>

          <ConnectHeader
            isConnected={isConnected}
            onConnect={() => setIsConnected(true)}
          />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 pt-0 lg:pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-white/[0.08] fixed left-0 top-16 h-[calc(100vh-64px)] flex-col" style={{ backgroundColor: 'rgba(13, 13, 18, 0.5)' }}>
          <nav className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
            <div className="px-4 py-3 mb-6">
              <h2 className="text-sm font-semibold text-[#B794F4] uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            <NavItemDesktop 
              icon={<Home size={18} />} 
              label="Home" 
              active={currentView === 'home'}
              onClick={() => setCurrentView('home')}
            />
            <NavItemDesktop 
              icon={<Library size={18} />} 
              label="Library"
              active={currentView === 'library'}
              onClick={() => setCurrentView('library')}
            />
            <NavItemDesktop 
              icon={<Search size={18} />} 
              label="Search"
              active={currentView === 'search'}
              onClick={() => setCurrentView('search')}
            />
            <NavItemDesktop 
              icon={<Upload size={18} />} 
              label="Upload"
              active={currentView === 'upload'}
              onClick={() => setCurrentView('upload')}
            />
            <NavItemDesktop 
              icon={<User size={18} />} 
              label="Profile"
              active={currentView === 'profile'}
              onClick={() => setCurrentView('profile')}
            />

            {isConnected && (
              <div className="mt-auto pt-4 border-t border-white/[0.08]">
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
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto lg:ml-64 pb-20 lg:pb-0">
          <div className="p-6 max-w-7xl mx-auto">
            {currentView === 'home' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Discover Music</h2>
                  <p className="text-white/60">
                    Explore the latest collaborative music NFTs on Base Sepolia
                  </p>
                </div>
                <MarketplaceGrid songs={mockSongs} isConnected={isConnected} />
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
                  <div className="p-12 text-center rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255, 31, 138, 0.4)' }} />
                    <h3 className="text-xl font-semibold mb-2">
                      Upload Your Track
                    </h3>
                    <p className="text-white/60 mb-6">
                      Drag and drop your audio file or click to browse
                    </p>
                    <Button style={{ backgroundColor: '#FF1F8A' }} className="hover:opacity-80">
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(183, 148, 244, 0.4)' }} />
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
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 border-t border-white/[0.08]" style={{ backgroundColor: 'rgba(13, 13, 18, 0.95)' }}>
        <div className="flex items-center justify-around h-16">
          <NavItemMobile 
            icon={<Home size={20} />} 
            active={currentView === 'home'}
            onClick={() => setCurrentView('home')}
          />
          <NavItemMobile 
            icon={<Library size={20} />}
            active={currentView === 'library'}
            onClick={() => setCurrentView('library')}
          />
          <NavItemMobile 
            icon={<Search size={20} />}
            active={currentView === 'search'}
            onClick={() => setCurrentView('search')}
          />
          <NavItemMobile 
            icon={<Upload size={20} />}
            active={currentView === 'upload'}
            onClick={() => setCurrentView('upload')}
          />
          <NavItemMobile 
            icon={<User size={20} />}
            active={currentView === 'profile'}
            onClick={() => setCurrentView('profile')}
          />
        </div>
      </nav>
    </div>
  )
}

function NavItemDesktop({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? 'text-[#FF1F8A] border border-[#FF1F8A]'
          : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
      }`}
      style={active ? { backgroundColor: 'rgba(255, 31, 138, 0.1)' } : {}}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function NavItemMobile({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-16 h-16 transition ${
        active
          ? 'text-[#FF1F8A]'
          : 'text-white/50 hover:text-white'
      }`}
    >
      {icon}
    </button>
  )
}
