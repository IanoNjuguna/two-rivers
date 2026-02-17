import React from 'react'
import BackButton from '@/components/BackButton'
import SimpleHeader from '@/components/SimpleHeader'

export default function FAQPage() {
  return (
    <div>
      <SimpleHeader />
      <div className="min-h-screen bg-[#0D0D12] text-white px-4 py-16 pt-32">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-white/70 mb-12">Quick answers to common questions about doba.</p>
        
        <div className="space-y-8">
          
          {/* General */}
          <section>
            <h2 className="text-2xl font-semibold text-[#FF1F8A] mb-6">General</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What is doba?</h3>
                <p className="text-white/80">doba is a music platform where fans can own the music they love and artists can profit from their work. We use blockchain technology (NFTs) to give fans true ownership and artists direct revenue.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Is doba free to use?</h3>
                <p className="text-white/80">Streaming music is free. Owning music (purchasing NFTs) requires payment. Artists pay a small gas fee to mint their music (usually less than $1).</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What blockchain does doba use?</h3>
                <p className="text-white/80">We're built on multiple blockchain networks. Our omnichain NFTs work across different chains, giving you flexibility with low transaction fees.</p>
              </div>
            </div>
          </section>

          {/* For Fans */}
          <section>
            <h2 className="text-2xl font-semibold text-[#FF1F8A] mb-6">For Fans</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Do I need crypto to use doba?</h3>
                <p className="text-white/80 mb-3">To stream music: No. To own music: Yes. You'll need:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-white/80 text-sm">
                  <li>A crypto wallet (like Coinbase Wallet or MetaMask)</li>
                  <li>Some crypto (ETH or native tokens) to purchase music</li>
                </ul>
                <p className="text-white/60 text-sm mt-3">New to crypto? Check our <a href="/docs" className="text-[#FF1F8A] hover:underline">Docs</a> for help getting started.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What's the difference between streaming and owning?</h3>
                <p className="text-white/80 mb-3">
                  <strong className="text-white">Streaming:</strong> Listen for free online, like any music platform.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">Owning:</strong> Purchase the music NFT, download high-quality files, listen offline forever, and resell if you want.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">How much does music cost?</h3>
                <p className="text-white/80">Artists set their own prices. Typical range is $5-20 for singles, $20-50 for albums. You're directly supporting independent artists.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Can I resell music I own?</h3>
                <p className="text-white/80">Yes! Music NFTs are yours to keep, trade, or resell. If you resell, the artist automatically gets a 10-15% royalty on the sale.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What happens if doba shuts down?</h3>
                <p className="text-white/80">Your music NFTs are stored on the blockchain, not on doba's servers. Even if doba disappeared, you'd still own your NFTs and could access them through other platforms or your wallet.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What file formats do I get?</h3>
                <p className="text-white/80">When you own a music NFT, you get high-quality audio files (WAV or FLAC) that you can download and play anywhere.</p>
              </div>
            </div>
          </section>

          {/* For Artists */}
          <section>
            <h2 className="text-2xl font-semibold text-[#B794F4] mb-6">For Artists</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">How much does doba take?</h3>
                <p className="text-white/80 mb-3">
                  <strong>Primary sales (first purchase):</strong> doba takes 7%, you keep 93%
                  <br />
                  <strong>Secondary sales (resales):</strong> doba takes 1%, you get 10-15% royalty, seller keeps the rest
                </p>
                <p className="text-white/60 text-sm">This is significantly better than streaming platforms or traditional record labels.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">How do I get paid?</h3>
                <p className="text-white/80">Earnings go directly to your crypto wallet instantly when someone buys your music. No waiting 30-90 days for payments.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Do I need approval to upload music?</h3>
                <p className="text-white/80">No approval needed. Anyone can upload music. However, you must own the rights to the music you upload. Violating copyright will result in takedowns.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">How much does it cost to mint music?</h3>
                <p className="text-white/80">You'll pay a gas fee to mint your music NFT, typically less than $1. This one-time fee publishes your music to the blockchain.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Can I upload music with collaborators?</h3>
                <p className="text-white/80">Yes! Add collaborator wallet addresses and set revenue split percentages. When the NFT sells, earnings automatically split to everyone.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What if someone steals my music?</h3>
                <p className="text-white/80">If someone uploads your copyrighted music without permission, you can file a DMCA takedown request. See our <a href="/terms" className="text-[#B794F4] hover:underline">Terms</a> for the process.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Can I delete or edit my music after minting?</h3>
                <p className="text-white/80">Once minted, NFTs are permanent on the blockchain. You can't delete or edit them. Make sure everything is correct before minting!</p>
              </div>
            </div>
          </section>

          {/* Technical */}
          <section>
            <h2 className="text-2xl font-semibold text-[#FF1F8A] mb-6">Technical</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What's a wallet?</h3>
                <p className="text-white/80">A crypto wallet is like a digital account that holds your cryptocurrency and NFTs. Popular options include Coinbase Wallet, MetaMask, and Rainbow.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What's an NFT?</h3>
                <p className="text-white/80">NFT = Non-Fungible Token. It's a unique digital certificate of ownership stored on the blockchain. When you buy a music NFT, you own that specific copy of the music.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What are gas fees?</h3>
                <p className="text-white/80">Gas fees are small payments to the blockchain network for processing transactions. Fees vary by network but are typically just a few cents on Layer 2 networks.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Is my data safe?</h3>
                <p className="text-white/80">We don't store passwords or private keys. Your wallet controls access to your NFTs. We only store public information like usernames and music metadata.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">What are omnichain NFTs?</h3>
                <p className="text-white/80 mb-2">
                  Omnichain NFTs can exist and be traded across multiple blockchain networks. Your music NFTs aren't locked to a single chain—they work anywhere.
                </p>
                <p className="text-white/60 text-sm">This gives you maximum flexibility and access to different marketplaces and ecosystems.</p>
              </div>
            </div>
          </section>

          {/* Still have questions? */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Still have questions?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/docs" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Read the Docs</h3>
                    <p className="text-sm text-white/60 mt-1">Detailed guides and tutorials</p>
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
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  )
}
