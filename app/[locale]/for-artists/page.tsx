import React from 'react'
import BackButton from '@/components/BackButton'
import SimpleHeader from '@/components/SimpleHeader'

export default function ForArtistsPage() {
  return (
    <div>
      <SimpleHeader />
      <div className="min-h-screen bg-[#0D0D12] text-white px-4 py-16 pt-32">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="text-4xl font-bold mb-4">For Artists</h1>
        <p className="text-xl text-white/70 mb-12">
          Take control of your music career. Mint, sell, and profit from your work.
        </p>
        
        <div className="space-y-12 text-white/80 leading-relaxed">
          
          {/* Why doba */}
          <section>
            <h2 className="text-3xl font-semibold text-white mb-6">Why Upload to doba?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Keep 93% of Sales</h3>
                <p className="text-sm">Unlike streaming platforms that pay fractions of a penny, you keep the vast majority of each sale.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Earn Forever</h3>
                <p className="text-sm">Get 10-15% royalties every time your music NFT is resold. Passive income for life.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">You Own Your Work</h3>
                <p className="text-sm">No record label deals. No giving up rights. Your music, your control, your profits.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Instant Payouts</h3>
                <p className="text-sm">Earnings go directly to your wallet. No waiting 30-90 days for payment processing.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Collaborate Easily</h3>
                <p className="text-sm">Auto-split revenue with collaborators. Set percentages once, payments happen automatically.</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Build Your Fanbase</h3>
                <p className="text-sm">Connect directly with fans who actually own your music and support your career.</p>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-white mb-6">Getting Started</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#FF1F8A]/10 to-[#B794F4]/10 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Step 1: Set Up Your Wallet</h3>
                <p className="mb-4">
                  You'll need a crypto wallet to receive payments and manage your music NFTs. We recommend:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                  <li><strong>Coinbase Wallet</strong> - Easiest for beginners</li>
                  <li><strong>MetaMask</strong> - Most popular, works everywhere</li>
                  <li><strong>Rainbow</strong> - Beautiful interface, great UX</li>
                </ul>
                <p className="mt-4 text-sm text-white/60">
                  New to wallets? Check our <a href="/docs/wallet-setup" className="text-[#FF1F8A] hover:underline">wallet setup guide</a>.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#FF1F8A]/10 to-[#B794F4]/10 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Step 2: Get Cryptocurrency</h3>
                <p className="mb-4">
                  You'll need a small amount of cryptocurrency to mint your music (usually &lt;$2 per track).
                </p>
                <p className="text-sm">
                  Buy crypto on Coinbase or another exchange, then transfer it to your wallet. doba will prompt you to switch to the right network when needed.
                </p>
                <p className="mt-4 text-sm text-white/60">
                  See our <a href="/docs" className="text-[#FF1F8A] hover:underline">Docs</a> for step-by-step crypto setup guides.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#FF1F8A]/10 to-[#B794F4]/10 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-3">Step 3: Upload & Mint</h3>
                <p className="mb-4">
                  Click "Upload" in doba, add your music file and cover art, set your price, and mint your NFT.
                </p>
                <p className="text-sm text-white/60">
                  Step-by-step walkthrough: <a href="/docs/minting-guide" className="text-[#FF1F8A] hover:underline">Minting your first track</a>
                </p>
              </div>
            </div>
          </section>

          {/* Revenue Breakdown */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-white mb-6">Revenue Breakdown</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Primary Sales (First Purchase)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Artist keeps</span>
                    <span className="text-2xl font-bold text-[#B794F4]">93%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>doba platform fee</span>
                    <span>7%</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/60">
                  Example: If you sell a track for 0.1 ETH (~$300), you get 0.093 ETH (~$279)
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Secondary Sales (Resales)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Seller keeps</span>
                    <span className="text-2xl font-bold">84-89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Artist royalty</span>
                    <span className="text-xl font-bold text-[#B794F4]">10-15%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>doba fee</span>
                    <span>1%</span>
                  </div>
                </div>
                <p className="mt-4 text-sm bg-[#B794F4]/10 rounded p-3">
                  <strong>You earn royalties forever.</strong> Every time your NFT is resold, you automatically 
                  receive 10-15% of the sale price. This compounds over time as your music appreciates in value.
                </p>
              </div>
            </div>
          </section>

          {/* Collaboration */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-white mb-6">Collaborative Projects</h2>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <p className="mb-4">
                Working with producers, featured artists, or other collaborators? doba makes revenue splits seamless.
              </p>
              
              <h3 className="text-lg font-semibold text-white mb-3">How It Works:</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
                <li>When uploading, add collaborator wallet addresses</li>
                <li>Set each person's revenue percentage (must add up to 100%)</li>
                <li>Mint the track—splits are locked on the blockchain</li>
                <li>When the NFT sells, earnings auto-split to all collaborators</li>
              </ol>

              <div className="bg-[#FF1F8A]/10 rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>Example:</strong> You (60%), Producer (30%), Featured Artist (10%)
                  <br />
                  If the track sells for 0.1 ETH, splits are automatic: You get 0.0558 ETH, Producer gets 0.0279 ETH, Featured Artist gets 0.093 ETH.
                </p>
              </div>

              <p className="mt-4 text-sm text-white/60">
                No arguments. No delayed payments. No manual calculations. Just transparent, automatic splits.
              </p>
            </div>
          </section>

          {/* Best Practices */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-white mb-6">Best Practices</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">✓ Upload High-Quality Audio</h3>
                <p className="text-sm">Use WAV or FLAC files for best sound quality. Fans are paying to own your music—give them the best version.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">✓ Create Eye-Catching Cover Art</h3>
                <p className="text-sm">Your cover art is the first thing fans see. Make it memorable. Minimum 1000x1000px.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">✓ Price Strategically</h3>
                <p className="text-sm">Start at $5-20 (0.015-0.06 ETH) for singles. Loyal fans will pay more for exclusive drops or limited editions.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">✓ Promote Your Drops</h3>
                <p className="text-sm">Share your doba links on social media, in your newsletter, and with your community. Your fans want to support you.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">✓ Engage Your Collectors</h3>
                <p className="text-sm">Fans who own your NFTs are your biggest supporters. Consider giving them perks like early access to new releases or exclusive content.</p>
              </div>
            </div>
          </section>

          {/* Copyright Notice */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-white mb-6">Copyright & Ownership</h2>
            
            <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
              <h3 className="font-semibold text-white mb-3">⚠️ Important: You Must Own the Rights</h3>
              <p className="mb-3">
                By uploading music to doba, you confirm that you own or have explicit permission to distribute this music. 
                This includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm mb-4">
                <li>You created the music yourself, or</li>
                <li>You have written permission from all rights holders, or</li>
                <li>The music is in the public domain or licensed for commercial use</li>
              </ul>
              <p className="text-sm">
                Uploading copyrighted music you don't own violates our <a href="/terms" className="text-[#FF1F8A] hover:underline">Terms of Service</a> and 
                may result in takedowns or legal action. We take copyright seriously.
              </p>
            </div>
          </section>

          {/* Support */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-white mb-6">Need Help?</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/docs" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Read the Docs</h3>
                    <p className="text-sm text-white/60 mt-1">Step-by-step guides and tutorials</p>
                  </div>
                  <span className="text-[#FF1F8A]">→</span>
                </div>
              </a>

              <a href="/faq" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">FAQ</h3>
                    <p className="text-sm text-white/60 mt-1">Quick answers to common questions</p>
                  </div>
                  <span className="text-[#FF1F8A]">→</span>
                </div>
              </a>

              <a href="/support" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Contact Support</h3>
                    <p className="text-sm text-white/60 mt-1">Get help from our team</p>
                  </div>
                  <span className="text-[#FF1F8A]">→</span>
                </div>
              </a>

              <a href="/how-it-works" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">How It Works</h3>
                    <p className="text-sm text-white/60 mt-1">Detailed walkthrough for artists</p>
                  </div>
                  <span className="text-[#FF1F8A]">→</span>
                </div>
              </a>
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  )
}
