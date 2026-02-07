'use client'

import React, { useState } from 'react'
import { Music, Home, Library, Search, Upload, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MarketplaceGrid from '@/components/MarketplaceGrid'
import MyStudioGrid from '@/components/MyStudioGrid'
import ConnectHeader from '@/components/ConnectHeader'
import NavItem from '@/components/NavItem' // Declare the NavItem variable

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-midnight text-white flex flex-col">
      {/* Header - Desktop Only */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-midnight/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyber-pink to-lavender flex items-center justify-center">
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
        <aside className="hidden lg:flex w-64 border-r border-white/[0.08] bg-midnight/50 backdrop-blur-sm fixed left-0 top-16 h-[calc(100vh-64px)] flex-col">
          <nav className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
            <div className="px-4 py-3 mb-6">
              <h2 className="text-sm font-semibold text-lavender uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            <NavItem 
              icon={<Home size={18} />} 
              label="Home" 
              active={currentView === 'home'}
              onClick={() => setCurrentView('home')}
            />
            <NavItem 
              icon={<Library size={18} />} 
              label="Library"
              active={currentView === 'library'}
              onClick={() => setCurrentView('library')}
            />
            <NavItem 
              icon={<Search size={18} />} 
              label="Search"
              active={currentView === 'search'}
              onClick={() => setCurrentView('search')}
            />
            <NavItem 
              icon={<Upload size={18} />} 
              label="Upload"
              active={currentView === 'upload'}
              onClick={() => setCurrentView('upload')}
            />
            <NavItem 
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
                  <div className="glass p-12 text-center rounded-xl">
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
                <div className="glass p-12 text-center rounded-xl">
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
                  <h2 className="text-2xl font-bold mb-2">Upload Track</h2>
                  <p className="text-white/60">
                    Create and mint your own music NFT
                  </p>
                </div>
                {isConnected ? (
                  <div className="glass p-12 text-center rounded-xl">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-cyber-pink/40" />
                    <h3 className="text-xl font-semibold mb-2">
                      Upload Your Track
                    </h3>
                    <p className="text-white/60 mb-6">
                      Drag and drop your audio file or click to browse
                    </p>
                    <Button className="bg-cyber-pink hover:bg-cyber-pink/80">
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="glass p-12 text-center rounded-xl">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
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
                  <div className="glass p-8 rounded-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyber-pink to-lavender" />
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
                  <div className="glass p-12 text-center rounded-xl">
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
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 border-t border-white/[0.08] bg-midnight/95 backdrop-blur-md">
        <div className="flex items-center justify-around h-16">
          <NavItem 
            icon={<Home size={20} />} 
            active={currentView === 'home'}
            onClick={() => setCurrentView('home')}
          />
          <NavItem 
            icon={<Library size={20} />}
            active={currentView === 'library'}
            onClick={() => setCurrentView('library')}
          />
          <NavItem 
            icon={<Search size={20} />}
            active={currentView === 'search'}
            onClick={() => setCurrentView('search')}
          />
          <NavItem 
            icon={<Upload size={20} />}
            active={currentView === 'upload'}
            onClick={() => setCurrentView('upload')}
          />
          <NavItem 
            icon={<User size={20} />}
            active={currentView === 'profile'}
            onClick={() => setCurrentView('profile')}
          />
        </div>
      </nav>
    </div>
  )
}
