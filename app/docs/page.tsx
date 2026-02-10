import React from 'react'
import BackButton from '@/components/BackButton'
import SimpleHeader from '@/components/SimpleHeader'

export default function DocsPage() {
  return (
    <div>
      <SimpleHeader />
      <div className="min-h-screen bg-[#0D0D12] text-white px-4 py-16 pt-32">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-white/70 mb-12">Everything you need to know about using doba, from crypto basics to advanced features.</p>
        
        <div className="space-y-12">
          
          {/* Getting Started */}
          <section>
            <h2 className="text-3xl font-semibold text-[#FF1F8A] mb-6">Getting Started with Crypto</h2>
            <p className="text-white/80 mb-6">New to cryptocurrency? Don't worry—we'll walk you through everything step by step.</p>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">1. What is Cryptocurrency?</h3>
                <p className="text-white/80 mb-4">
                  Cryptocurrency is digital money that works without banks. Instead of a bank keeping track of your balance, 
                  a network of computers (the blockchain) keeps a permanent record of all transactions.
                </p>
                <p className="text-white/80">
                  <strong className="text-white">ETH (Ethereum)</strong> is the cryptocurrency used on doba. Think of it like digital cash for the internet.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">2. What is a Wallet?</h3>
                <p className="text-white/80 mb-4">
                  A crypto wallet is like a digital bank account, but you control it completely—no bank involved. 
                  Your wallet holds your cryptocurrency and NFTs.
                </p>
                <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm">
                  <p><strong className="text-white">Important:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-white/70">
                    <li>You control your wallet with a secret phrase (seed phrase)</li>
                    <li>Never share your seed phrase with anyone</li>
                    <li>If you lose your seed phrase, you lose access forever</li>
                    <li>doba never asks for your seed phrase</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">3. What is an NFT?</h3>
                <p className="text-white/80 mb-4">
                  NFT = Non-Fungible Token. It's a digital certificate of ownership stored on the blockchain.
                </p>
                <p className="text-white/80 mb-4">
                  When you buy a music NFT on doba, you get:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-white/80">
                  <li>Proof you own that specific copy of the music</li>
                  <li>High-quality audio files you can download</li>
                  <li>The ability to resell or trade your NFT</li>
                  <li>Permanent ownership—no one can take it away</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Setting Up Your Wallet */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-[#FF1F8A] mb-6">Setting Up Your Wallet</h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#FF1F8A]/10 to-[#B794F4]/10 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Step 1: Choose a Wallet</h3>
                <p className="text-white/80 mb-4">We recommend one of these wallets for doba:</p>
                
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Coinbase Wallet (Easiest)</h4>
                    <p className="text-sm text-white/70 mb-2">Best for beginners. Simple interface, easy to buy crypto.</p>
                    <a href="https://www.coinbase.com/wallet" target="_blank" rel="noopener noreferrer" className="text-[#FF1F8A] hover:underline text-sm">
                      Download Coinbase Wallet →
                    </a>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">MetaMask (Most Popular)</h4>
                    <p className="text-sm text-white/70 mb-2">Works everywhere, trusted by millions. Browser extension + mobile app.</p>
                    <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-[#FF1F8A] hover:underline text-sm">
                      Download MetaMask →
                    </a>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Rainbow (Beautiful)</h4>
                    <p className="text-sm text-white/70 mb-2">Clean design, great for mobile. iOS and Android.</p>
                    <a href="https://rainbow.me" target="_blank" rel="noopener noreferrer" className="text-[#FF1F8A] hover:underline text-sm">
                      Download Rainbow →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#FF1F8A]/10 to-[#B794F4]/10 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Step 2: Connect to Supported Networks</h3>
                <p className="text-white/80 mb-4">
                  doba works with multiple blockchain networks. Your wallet will prompt you to switch networks when needed.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-sm text-white/80 mb-3"><strong>Adding Networks:</strong></p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-white/70 ml-4">
                    <li>Click the network dropdown in your wallet</li>
                    <li>Click "Add Network" or "Custom RPC"</li>
                    <li>doba will automatically prompt you to add supported networks</li>
                    <li>Approve the network addition when prompted</li>
                  </ol>
                  <p className="text-xs text-white/60 mt-3">
                    Or visit <a href="https://chainlist.org" target="_blank" rel="noopener noreferrer" className="text-[#FF1F8A] hover:underline">chainlist.org</a> to add networks manually.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#FF1F8A]/10 to-[#B794F4]/10 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Step 3: Get Cryptocurrency</h3>
                <p className="text-white/80 mb-4">You need cryptocurrency to buy music and pay transaction fees. The specific token depends on which network you're using.</p>
                
                <div className="space-y-3">
                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Option A: Buy on an Exchange</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-white/70 ml-4">
                      <li>Buy crypto on Coinbase, Binance, or another exchange</li>
                      <li>Send crypto to your wallet address</li>
                      <li>Use a bridge if you need to switch networks</li>
                    </ol>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Option B: Use a Fiat On-Ramp</h4>
                    <p className="text-sm text-white/70 mb-2">Buy crypto directly with a credit card:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-white/60 ml-4">
                      <li>Moonpay (integrated in many wallets)</li>
                      <li>Ramp Network</li>
                      <li>Transak</li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-white/60 mt-4">
                  💡 <strong>Tip:</strong> Start with $20-50 worth of crypto. That's enough to buy several songs and cover gas fees.
                </p>
              </div>
            </div>
          </section>

          {/* Using doba */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-[#FF1F8A] mb-6">Using doba</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Connecting Your Wallet</h3>
                <ol className="list-decimal list-inside space-y-2 text-white/80 ml-4">
                  <li>Click "Sign in" in the top right of doba</li>
                  <li>Choose your wallet from the popup</li>
                  <li>Approve the connection in your wallet</li>
                  <li>You're in! Your wallet address will show in the header</li>
                </ol>
                <p className="text-sm text-white/60 mt-4">
                  ✅ doba never gets access to your funds. Connecting just lets the app know your wallet address.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Buying Music</h3>
                <ol className="list-decimal list-inside space-y-2 text-white/80 ml-4">
                  <li>Browse the marketplace and find music you love</li>
                  <li>Stream for free to preview</li>
                  <li>Click "Buy" when you want to own it</li>
                  <li>Your wallet will prompt you to switch networks if needed</li>
                  <li>Confirm the transaction in your wallet</li>
                  <li>Wait a few seconds for blockchain confirmation</li>
                  <li>Done! The NFT is now in "My Studio" and you can download the files</li>
                </ol>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Understanding Gas Fees</h3>
                <p className="text-white/80 mb-4">
                  Gas fees are payments to the blockchain network for processing your transaction. They're separate from the music price.
                </p>
                <div className="bg-black/30 rounded-lg p-4 space-y-2 text-sm">
                  <p className="text-white/80"><strong>Typical gas fees (vary by network):</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-white/70">
                    <li>Buying music: $0.01 - $0.50</li>
                    <li>Minting music: $0.50 - $2.00</li>
                    <li>Transferring NFTs: $0.01 - $0.20</li>
                  </ul>
                  <p className="text-white/60 mt-2">Gas fees fluctuate based on network activity. Layer 2 networks are usually cheapest.</p>
                </div>
              </div>
            </div>
          </section>

          {/* For Artists */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-[#B794F4] mb-6">For Artists</h2>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Minting Your First Track</h3>
                <ol className="list-decimal list-inside space-y-2 text-white/80 ml-4">
                  <li>Connect your wallet and sign in</li>
                  <li>Click "Upload" in the navigation</li>
                  <li>Upload your audio file (WAV or FLAC recommended)</li>
                  <li>Add cover art (1000x1000px minimum)</li>
                  <li>Fill in track details (title, description, tags)</li>
                  <li>Set your price in ETH</li>
                  <li>Add collaborators if applicable (optional)</li>
                  <li>Click "Mint" and confirm the transaction</li>
                  <li>Wait for confirmation—your track is now live!</li>
                </ol>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Setting Up Collaborations</h3>
                <p className="text-white/80 mb-4">When minting a collaborative track:</p>
                <ol className="list-decimal list-inside space-y-2 text-white/80 ml-4">
                  <li>Click "Add Collaborator"</li>
                  <li>Enter each person's wallet address</li>
                  <li>Set their revenue percentage</li>
                  <li>Make sure percentages add up to 100%</li>
                  <li>Mint the track—splits are permanent and automatic</li>
                </ol>
                <p className="text-sm text-white/60 mt-4">
                  💡 Get wallet addresses from your collaborators before minting. Splits can't be changed after minting!
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Tracking Your Earnings</h3>
                <p className="text-white/80 mb-4">All earnings go directly to your wallet instantly. To view analytics:</p>
                <ul className="list-disc list-inside space-y-2 text-white/80 ml-4">
                  <li>Go to "My Studio" tab</li>
                  <li>Click "View Revenue" on any track</li>
                  <li>See total earnings, number of sales, royalties</li>
                  <li>Check your wallet for actual ETH balance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-[#FF1F8A] mb-6">Security Best Practices</h2>
            
            <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
              <h3 className="text-xl font-semibold mb-4 text-yellow-200">🔒 Keep Your Wallet Safe</h3>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-200 flex-shrink-0">•</span>
                  <span><strong>Never share your seed phrase</strong> - Not even with doba support. We'll never ask for it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-200 flex-shrink-0">•</span>
                  <span><strong>Write down your seed phrase</strong> - Store it somewhere safe, offline. If you lose it, your crypto is gone forever.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-200 flex-shrink-0">•</span>
                  <span><strong>Double-check addresses</strong> - Before sending crypto, verify the wallet address is correct. Typos = lost funds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-200 flex-shrink-0">•</span>
                  <span><strong>Beware of scams</strong> - doba will never DM you asking for money or seed phrases. Be suspicious of too-good-to-be-true offers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-200 flex-shrink-0">•</span>
                  <span><strong>Use hardware wallets for large amounts</strong> - If you're holding significant value, consider a Ledger or Trezor.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-[#FF1F8A] mb-6">Troubleshooting</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold mb-2">Transaction failed / stuck</h3>
                <p className="text-sm text-white/80">Try increasing the gas limit in your wallet settings, or wait for network congestion to clear.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold mb-2">Wallet won't connect</h3>
                <p className="text-sm text-white/80">Make sure you're on a supported network in your wallet. Refresh the page and try again. doba will prompt you to switch networks if needed.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold mb-2">Don't see my NFT after purchase</h3>
                <p className="text-sm text-white/80">Wait 30-60 seconds for blockchain confirmation, then refresh the page. Check "My Studio" tab. Verify transaction on the block explorer for your network.</p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="font-semibold mb-2">Can't download music files</h3>
                <p className="text-sm text-white/80">Make sure you own the NFT (check "My Studio"). Try a different browser or clear cache.</p>
              </div>
            </div>

            <p className="text-white/60 text-sm mt-6">
              Still stuck? <a href="/support" className="text-[#FF1F8A] hover:underline">Contact support</a> and we'll help you out.
            </p>
          </section>

          {/* Resources */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-semibold text-[#FF1F8A] mb-6">Additional Resources</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/how-it-works" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">How It Works</h3>
                    <p className="text-sm text-white/60 mt-1">Visual guides for fans and artists</p>
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

              <a href="/for-artists" className="block bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">For Artists</h3>
                    <p className="text-sm text-white/60 mt-1">Complete artist onboarding guide</p>
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
