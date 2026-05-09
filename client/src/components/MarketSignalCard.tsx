interface MarketSignalCardProps {
  market: string
  signal?: any
}

export default function MarketSignalCard({ market, signal }: MarketSignalCardProps) {
  if (!signal) return null

  const getSignalColor = (value: string) => {
    if (value === 'EVEN' || value === 'OVER') return 'text-green-400'
    return 'text-pink-400'
  }

  return (
    <div className="card p-4 hover:border-pink-500 transition-all"
         style={{
           borderColor: signal.evenOddBias === 'EVEN' ? '#39ff14' : '#ff006e',
           boxShadow: signal.evenOddBias === 'EVEN' 
             ? '0 0 15px rgba(57, 255, 20, 0.3)' 
             : '0 0 15px rgba(255, 0, 110, 0.3)'
         }}>
      <h3 className="text-xs font-bold text-cyan-300 mb-3 truncate">{market}</h3>
      
      <div className="space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-500">Even/Odd:</span>
          <span className={`font-bold ${getSignalColor(signal.evenOddBias)}`}>
            {signal.evenOddBias}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Streak:</span>
          <span className="text-cyan-400">{signal.evenOddStreak}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Over/Under 5:</span>
          <span className={`font-bold ${getSignalColor(signal.overUnder5)}`}>
            {signal.overUnder5}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Hot Digit:</span>
          <span className="text-pink-400">{signal.hotDigit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Cold Digit:</span>
          <span className="text-blue-400">{signal.coldDigit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Volatility:</span>
          <span className="text-green-400">{signal.volatility}%</span>
        </div>
      </div>
    </div>
  )
}
