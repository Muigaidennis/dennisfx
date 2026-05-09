export default function AIAnalysis() {
  const markets = [
    'Volatility 10 Index',
    'Volatility 25 Index',
    'Volatility 50 Index',
    'Volatility 100 Index'
  ]

  return (
    <div className="min-h-screen bg-black pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-cyan-400 mb-2">AI MARKET ANALYSIS</h1>
          <p className="text-gray-400 font-mono">Deep signal breakdowns powered by advanced AI</p>
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {markets.map((market, i) => (
            <div key={i} className="card p-8">
              <h2 className="text-xl font-bold text-pink-500 mb-4">{market}</h2>
              <div className="space-y-4 text-gray-300 font-mono text-sm leading-relaxed">
                <p>
                  <strong className="text-cyan-400">Current Signal:</strong> Even bias detected with a streak of 7 consecutive even outcomes. This suggests a slight market preference for even numbers in the current trading session.
                </p>
                <p>
                  <strong className="text-cyan-400">Hot Digit Analysis:</strong> Digit 7 is currently hot with 12 occurrences in the last 50 ticks. Consider incorporating this into your trading strategy.
                </p>
                <p>
                  <strong className="text-cyan-400">Volatility Trend:</strong> Volatility is trending upward at 67.5%, indicating increased market activity and potential trading opportunities.
                </p>
                <p>
                  <strong className="text-cyan-400">Recommendation:</strong> Monitor the even/odd bias closely. If the streak extends beyond 10, consider a reversal signal.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Even/Odd Comparison */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Even/Odd Comparison</h2>
          <div className="card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Vol 10', even: 52, odd: 48 },
                { label: 'Vol 25', even: 49, odd: 51 },
                { label: 'Vol 50', even: 55, odd: 45 },
                { label: 'Vol 100', even: 48, odd: 52 }
              ].map((stat, i) => (
                <div key={i}>
                  <h3 className="font-bold text-pink-500 mb-4">{stat.label}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="text-cyan-400 font-bold">{stat.even}%</div>
                      <div className="text-gray-400 text-sm">Even</div>
                    </div>
                    <div>
                      <div className="text-pink-400 font-bold">{stat.odd}%</div>
                      <div className="text-gray-400 text-sm">Odd</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
