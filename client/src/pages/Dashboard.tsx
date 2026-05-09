import { useState, useEffect } from 'react'
import MarketSignalCard from '../components/MarketSignalCard'

const VOLATILITY_INDICES = [
  'Volatility 10 Index',
  'Volatility 25 Index',
  'Volatility 50 Index',
  'Volatility 75 Index',
  'Volatility 100 Index',
  'Volatility 150 Index',
  'Volatility 200 Index',
  'Volatility 250 Index',
  'Volatility 300 Index',
  'Volatility 10 (1s) Index',
  'Volatility 25 (1s) Index',
  'Volatility 50 (1s) Index',
  'Volatility 100 (1s) Index',
  'Volatility 150 (1s) Index'
]

export default function Dashboard() {
  const [signals, setSignals] = useState<Record<string, any>>({})

  useEffect(() => {
    // Initialize mock signals
    const mockSignals: Record<string, any> = {}
    VOLATILITY_INDICES.forEach(index => {
      mockSignals[index] = {
        evenOddBias: Math.random() > 0.5 ? 'EVEN' : 'ODD',
        evenOddStreak: Math.floor(Math.random() * 20),
        overUnder5: Math.random() > 0.5 ? 'OVER' : 'UNDER',
        overUnder5Streak: Math.floor(Math.random() * 15),
        hotDigit: Math.floor(Math.random() * 10),
        coldDigit: Math.floor(Math.random() * 10),
        volatility: (Math.random() * 100).toFixed(2)
      }
    })
    setSignals(mockSignals)

    // Simulate WebSocket updates
    const interval = setInterval(() => {
      setSignals(prev => ({
        ...prev,
        [VOLATILITY_INDICES[Math.floor(Math.random() * VOLATILITY_INDICES.length)]]: {
          evenOddBias: Math.random() > 0.5 ? 'EVEN' : 'ODD',
          evenOddStreak: Math.floor(Math.random() * 20),
          overUnder5: Math.random() > 0.5 ? 'OVER' : 'UNDER',
          overUnder5Streak: Math.floor(Math.random() * 15),
          hotDigit: Math.floor(Math.random() * 10),
          coldDigit: Math.floor(Math.random() * 10),
          volatility: (Math.random() * 100).toFixed(2)
        }
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-cyan-400 mb-2">MARKET SIGNALS</h1>
          <p className="text-gray-400 font-mono">Real-time trading signals for all Deriv volatility indices</p>
        </div>

        {/* Signals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {VOLATILITY_INDICES.map(index => (
            <MarketSignalCard
              key={index}
              market={index}
              signal={signals[index]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
