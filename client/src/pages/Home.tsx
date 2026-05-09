import { Link } from 'wouter'

export default function Home() {
  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-black mb-4" style={{
          backgroundImage: 'linear-gradient(135deg, #ff006e, #00f5ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 40px rgba(255, 0, 110, 0.8)'
        }}>
          ELITE TRADING SIGNALS
        </h1>
        <p className="text-xl text-cyan-400 mb-8 font-mono">
          Real-time market analysis. Automated bot management. Professional-grade signals.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-6 justify-center mb-16 flex-wrap">
          <Link href="/dashboard">
            <button className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black transition-all"
                    style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)' }}>
              View Dashboard
            </button>
          </Link>
          <Link href="/bot-builder">
            <button className="px-8 py-3 border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-black transition-all"
                    style={{ boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)' }}>
              Build Bot
            </button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { title: 'Real-Time Signals', desc: 'Live market data from Deriv' },
            { title: 'Bot Management', desc: 'Upload and share trading bots' },
            { title: 'AI Analysis', desc: 'Deep market insights & predictions' }
          ].map((feature, i) => (
            <div key={i} className="card p-6 text-left">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">{feature.title}</h3>
              <p className="text-gray-400 font-mono text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
