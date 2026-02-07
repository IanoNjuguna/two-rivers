'use client'

import React, { useState } from 'react'
import { Music, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SongCard from '@/components/SongCard'
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

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-midnight text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-midnight/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/[0.05] rounded-lg transition"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyber-pink to-lavender flex items-center justify-center">
                <Music size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold hidden sm:block">Music NFT</h1>
            </div>
          </div>

          <ConnectHeader
            isConnected={isConnected}
            onConnect={() => setIsConnected(true)}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static left-0 top-16 bottom-0 w-64 border-r border-white/[0.08] bg-midnight/50 backdrop-blur-sm transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="flex flex-col p-4 gap-2">
            <div className="px-4 py-3 mb-6">
              <h2 className="text-sm font-semibold text-lavender uppercase tracking-wider">
                Navigation
              </h2>
            </div>

            <NavItem icon={<Music size={18} />} label="Marketplace" active />
            <NavItem icon={<Music size={18} />} label="My Studio" />

            {isConnected && (
              <div className="absolute bottom-4 left-4 right-4">
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
        <main
          className="flex-1 overflow-auto"
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="marketplace" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/[0.05] border border-white/[0.08] mb-8">
                <TabsTrigger
                  value="marketplace"
                  className="text-foreground data-[state=active]:bg-cyber-pink/20 data-[state=active]:text-cyber-pink"
                >
                  Music Marketplace
                </TabsTrigger>
                <TabsTrigger
                  value="studio"
                  className="text-foreground data-[state=active]:bg-cyber-pink/20 data-[state=active]:text-cyber-pink"
                >
                  My Studio
                </TabsTrigger>
              </TabsList>

              {/* Marketplace Tab */}
              <TabsContent value="marketplace" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Music Marketplace</h2>
                  <p className="text-white/60">
                    Discover and mint collaborative music NFTs on Base Sepolia
                  </p>
                </div>
                <MarketplaceGrid songs={mockSongs} isConnected={isConnected} />
              </TabsContent>

              {/* Studio Tab */}
              <TabsContent value="studio" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">My Studio</h2>
                  <p className="text-white/60">
                    Manage your NFTs and earnings
                  </p>
                </div>
                {isConnected ? (
                  <MyStudioGrid nfts={mockOwnedNFTs} />
                ) : (
                  <div className="glass p-12 text-center rounded-xl">
                    <Music className="w-12 h-12 mx-auto mb-4 text-lavender/40" />
                    <h3 className="text-xl font-semibold mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-white/60">
                      Connect your wallet to view and manage your NFTs
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        active
          ? 'bg-gradient-to-r from-cyber-pink/20 to-lavender/10 text-cyber-pink border border-cyber-pink/30'
          : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
