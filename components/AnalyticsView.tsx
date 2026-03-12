'use client'

import { useState, useEffect } from 'react'
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
	BarChart, Bar, Cell
} from 'recharts'
import { IconMusic, IconUsers, IconTrendingUp, IconHeadphones } from '@tabler/icons-react'
import { useAudio } from '@/components/AudioProvider'
import { cn } from '@/lib/utils'

interface AnalyticsData {
	totalPlays: number
	uniqueListeners: number
	playsOverTime: { date: string; count: number }[]
	topTracks: { tokenId: number; name: string; plays: number }[]
}

export default function AnalyticsView() {
	const { getValidToken, isAuthenticated } = useAudio()
	const [data, setData] = useState<AnalyticsData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchAnalytics = async () => {
		try {
			setLoading(true)
			const token = await getValidToken()
			if (!token) {
				setError("Not authenticated")
				return
			}

			const res = await fetch('/api-backend/analytics', {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			})

			if (!res.ok) throw new Error('Failed to fetch analytics')
			const result = await res.json()
			setData(result)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (isAuthenticated) {
			fetchAnalytics()
		}
	}, [isAuthenticated])

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center p-24 space-y-4">
				<div className="w-8 h-8 border-2 border-[#FF1F8A] border-t-transparent rounded-full animate-spin" />
				<p className="text-white/40 italic">Aggregating artist data...</p>
			</div>
		)
	}

	if (error || !data) {
		return (
			<div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.08]">
				<IconTrendingUp className="w-12 h-12 mx-auto mb-4 text-white/20" />
				<h3 className="text-xl font-semibold mb-2">Analytics unavailable</h3>
				<p className="text-white/60 mb-6">{error || "Connect your wallet to see your artist performance."}</p>
			</div>
		)
	}

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Metrics Row */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<MetricCard
					label="Total Plays"
					value={data.totalPlays.toLocaleString()}
					icon={<IconHeadphones className="text-cyber-pink" size={24} />}
					subtext="Lifetime streams"
				/>
				<MetricCard
					label="Unique Listeners"
					value={data.uniqueListeners.toLocaleString()}
					icon={<IconUsers className="text-[#B794F4]" size={24} />}
					subtext="Audience reach"
				/>
				<MetricCard
					label="Growth"
					value={`${data.totalPlays > 0 ? '+100%' : '0%'}`}
					icon={<IconTrendingUp className="text-green-400" size={24} />}
					subtext="Last 30 days"
				/>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Plays Over Time */}
				<div className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-xl">
					<h3 className="text-lg font-bold mb-6 flex items-center gap-2">
						<IconTrendingUp size={20} className="text-[#B794F4]" />
						Streaming Activity
					</h3>
					<div className="h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={data.playsOverTime}>
								<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis
									dataKey="date"
									stroke="rgba(255,255,255,0.3)"
									fontSize={10}
									tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
								/>
								<YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
								<Tooltip
									contentStyle={{ backgroundColor: '#1A1A22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
									itemStyle={{ color: '#FF1F8A' }}
									labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}
								/>
								<Line
									type="monotone"
									dataKey="count"
									stroke="#FF1F8A"
									strokeWidth={3}
									dot={{ fill: '#FF1F8A', strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Top Tracks */}
				<div className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-xl text-white">
					<h3 className="text-lg font-bold mb-6 flex items-center gap-2">
						<IconMusic size={20} className="text-[#B794F4]" />
						Top Performing Tracks
					</h3>
					<div className="space-y-4">
						{data.topTracks.length > 0 ? (
							data.topTracks.map((track, idx) => (
								<div key={track.tokenId} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.05] transition-colors group">
									<div className="flex items-center gap-4">
										<span className="text-white/20 font-bold italic w-4">{idx + 1}</span>
										<div>
											<p className="font-semibold text-sm group-hover:text-cyber-pink transition-colors">{track.name}</p>
											<p className="text-[10px] text-white/40 uppercase tracking-widest">Token ID #{track.tokenId}</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-bold text-[#B794F4] text-sm">{track.plays} plays</p>
										<div className="h-1 bg-white/10 w-20 rounded-full mt-1 overflow-hidden">
											<div
												className="h-full bg-cyber-pink"
												style={{ width: `${(track.plays / (data.topTracks[0]?.plays || 1)) * 100}%` }}
											/>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="p-12 text-center text-white/40 italic text-sm">
								No streaming data yet.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

function MetricCard({ label, value, icon, subtext }: { label: string; value: string; icon: React.ReactNode; subtext: string }) {
	return (
		<div className="bg-white/[0.02] border border-white/[0.08] p-6 rounded-xl hover:border-[#B794F4]/30 transition-all group">
			<div className="flex items-center justify-between mb-4">
				<span className="text-white/40 text-xs font-bold uppercase tracking-widest">{label}</span>
				<div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
					{icon}
				</div>
			</div>
			<p className="text-3xl font-bold mb-1 tracking-tight text-white">{value}</p>
			<p className="text-xs text-white/20">{subtext}</p>
		</div>
	)
}
