import { logger } from '@/lib/logger'
import { useEffect, useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { IconTrendingUp, IconCalendar, IconCurrencyDollar as DollarSign, IconCheck, IconExternalLink } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { useChainId } from "wagmi"
import { SPLITTER_ABI, ERC20_ABI, formatAddress, fetchAllBalances, ChainBalances, getAddressesForChain } from '@/lib/web3'
import { parseUnits, formatUnits } from 'viem'
import { toast } from 'sonner'

interface EarningsViewProps {
  isConnected: boolean
  client?: any
  address?: string
}

interface Track {
  token_id: number
  name: string
  artist: string
  splitter: string
}

interface RoyaltyEntry {
  track: string
  tokenId: number
  splitter: string
  pending: string
  shares: number
}

const API_URL = '/api-backend'

export default function EarningsView({ isConnected, client, address }: EarningsViewProps) {
  const t = useTranslations('earnings')
  const chainId = useChainId()
  const CURRENT_USDC = getAddressesForChain(chainId || 42161).usdc
  const [loading, setLoading] = useState(false)
  const [royaltyTracks, setRoyaltyTracks] = useState<RoyaltyEntry[]>([])
  const [totalPending, setTotalPending] = useState('0.00')
  const [isClaiming, setIsClaiming] = useState(false)
  const [globalBalances, setGlobalBalances] = useState<ChainBalances[]>([])

  const fetchEarnings = async () => {
    if (!isConnected || !client || !address) return
    setLoading(true)
    try {
      // Fetch multi-chain balances
      fetchAllBalances(address).then(setGlobalBalances)

      // 1. Fetch all tracks to find splitters
      const res = await fetch(`${API_URL.replace(/\/$/, '')}/tracks`)
      const tracks: Track[] = await res.json()

      const entries: RoyaltyEntry[] = []
      let total = 0n

      // 2. Filter tracks where user has shares in the splitter
      for (const track of tracks) {
        if (!track.splitter || track.splitter === '0x0000000000000000000000000000000000000000') continue

        try {
          // Check shares
          const userShares = await client.readContract({
            address: track.splitter as `0x${string}`,
            abi: SPLITTER_ABI,
            functionName: 'shares',
            args: [address as `0x${string}`],
          }) as bigint

          if (userShares > 0n) {
            // Check pending payout
            const [balance, totalReleased, totalShares, releasedByMe] = await Promise.all([
              client.readContract({
                address: CURRENT_USDC as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [track.splitter as `0x${string}`],
              }),
              client.readContract({
                address: track.splitter as `0x${string}`,
                abi: SPLITTER_ABI,
                functionName: 'totalReleasedERC20',
                args: [CURRENT_USDC as `0x${string}`],
              }),
              client.readContract({
                address: track.splitter as `0x${string}`,
                abi: SPLITTER_ABI,
                functionName: 'totalShares',
              }),
              client.readContract({
                address: track.splitter as `0x${string}`,
                abi: SPLITTER_ABI,
                functionName: 'releasedERC20',
                args: [CURRENT_USDC as `0x${string}`, address as `0x${string}`],
              }),
            ])

            const totalReceived = (balance as bigint) + (totalReleased as bigint)
            const myDue = (totalReceived * userShares) / (totalShares as bigint)
            const pending = myDue - (releasedByMe as bigint)

            if (pending > 0n || true) { // Show all tracks where I have shares
              entries.push({
                track: track.name,
                tokenId: track.token_id,
                splitter: track.splitter,
                pending: formatUnits(pending, 6),
                shares: Number(userShares) / 100
              })
              total += pending
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch shares for splitter ${track.splitter}:`, e)
        }
      }

      setRoyaltyTracks(entries)
      setTotalPending(formatUnits(total, 6))
    } catch (error) {
      logger.error('Error fetching earnings', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [isConnected, address, client])

  const handleClaimAll = async () => {
    if (!client || royaltyTracks.length === 0) return
    setIsClaiming(true)
    const claimToast = toast.loading("Claiming royalties...")

    try {
      const pendingTracks = royaltyTracks.filter(t => parseFloat(t.pending) > 0)
      if (pendingTracks.length === 0) {
        toast.info("No pending royalties to claim", { id: claimToast })
        return
      }

      const calls = pendingTracks.map(t => ({
        target: t.splitter as `0x${string}`,
        data: encodeFunctionData({
          abi: SPLITTER_ABI,
          functionName: 'releaseERC20',
          args: [CURRENT_USDC as `0x${string}`, address as `0x${string}`]
        })
      }))

      const { hash } = await client.sendUserOperation({ uo: calls })
      await client.waitForUserOperationTransaction({ hash })

      toast.success("Royalties claimed successfully!", { id: claimToast })
      fetchEarnings()
    } catch (e: any) {
      logger.error('Claim failed', e)
      toast.error(`Claim failed: ${e.message}`, { id: claimToast })
    } finally {
      setIsClaiming(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
          <p className="text-white/60">{t('subtitle')}</p>
        </div>
        <div className="border border-white/[0.08] rounded-lg p-12 text-center bg-dark-primary-30">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-lavender-10 flex items-center justify-center text-[#B794F4]">
            <DollarSign size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('signInToView')}</h3>
          <p className="text-white/60">{t('connectToSee')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
          <p className="text-white/60">{t('subtitle')}</p>
        </div>
        <button
          onClick={fetchEarnings}
          className="text-xs text-[#B794F4] hover:underline"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="mt-8 mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-cyber-pink" />
        <h2 className="text-white font-bold uppercase tracking-widest text-xs opacity-60">
          {t('crossChainAssets')}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-white/[0.08] rounded-lg p-6 bg-dark-primary-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm">{t('pendingPayout')}</h3>
            <IconTrendingUp size={16} className="text-[#B794F4]" />
          </div>
          <p className="text-2xl font-bold">{totalPending} USDC</p>
          <p className="text-white/40 text-xs mt-2">{t('readyToClaim')}</p>
        </div>

        {globalBalances.map((b) => (
          <div key={b.chainId} className="border border-white/[0.08] rounded-lg p-5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <img src={`/images/${b.chainName.toLowerCase()}.png`} alt={b.chainName} className="w-4 h-4" />
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">{b.chainName}</h3>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-white/40 font-bold uppercase">Native</span>
                <span className="text-sm font-mono text-white/90">{parseFloat(b.native).toFixed(4)} {b.nativeSymbol}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-cyber-pink/40 font-bold uppercase">USDC</span>
                <span className="text-sm font-mono text-cyber-pink">{parseFloat(b.usdc).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-white/[0.08] rounded-lg overflow-hidden bg-dark-primary-30">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="font-semibold">Collaborator Splits</h3>
        </div>

        <div className="divide-y divide-white/[0.08]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-[#FF1F8A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/40 text-sm italic">Verifying your shares on-chain...</p>
            </div>
          ) : royaltyTracks.length > 0 ? (
            royaltyTracks.map((entry, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    {entry.track}
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/40">ID #{entry.tokenId}</span>
                  </p>
                  <p className="text-xs text-white/40 truncate flex items-center gap-1">
                    Splitter: {formatAddress(entry.splitter)}
                    <a href={`https://arbiscan.io/address/${entry.splitter}`} target="_blank" className="hover:text-white" title="View on Explorer"><IconExternalLink size={10} /></a>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#FF1F8A]">{entry.pending} USDC</p>
                  <p className="text-xs text-white/40">{entry.shares}% Share</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-white/40 text-sm italic">{t('noEarningsHistory') || "You are not listed as a collaborator on any published tracks yet."}</p>
            </div>
          )}
        </div>
      </div>

      <button
        disabled={isClaiming || parseFloat(totalPending) === 0}
        onClick={handleClaimAll}
        className="w-full py-4 rounded-lg font-bold transition bg-[#FF1F8A] text-white hover:bg-[#E01A73] shadow-lg shadow-[#FF1F8A]/20 disabled:opacity-50 disabled:grayscale"
      >
        {isClaiming ? 'Processing Claims...' : t('claimEarnings')}
      </button>
    </div>
  )
}

// Helper for batch decoding in handleClaimAll
async function encodeFunctionData({ abi, functionName, args }: any) {
  const { encodeFunctionData } = await import('viem')
  return encodeFunctionData({ abi, functionName, args })
}
