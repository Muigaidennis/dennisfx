import { useState } from 'react'
import BotCard from '../components/BotCard'

export default function BotBuilder() {
  const [bots, setBots] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    Array.from(files).forEach(file => {
      if (file.name.endsWith('.dbot') || file.name.endsWith('.xml')) {
        const newBot = {
          id: Date.now(),
          name: file.name,
          size: (file.size / 1024).toFixed(2),
          uploadedAt: new Date().toLocaleString()
        }
        setBots([...bots, newBot])
      }
    })
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-pink-500 mb-2">BOT BUILDER</h1>
          <p className="text-gray-400 font-mono">Upload and manage your trading bots</p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`card p-12 text-center mb-12 transition-all cursor-pointer ${
            isDragging ? 'border-pink-500 bg-pink-500 bg-opacity-10' : 'border-cyan-500'
          }`}
          style={{
            boxShadow: isDragging ? '0 0 30px rgba(255, 0, 110, 0.5)' : '0 0 20px rgba(0, 245, 255, 0.1)'
          }}
        >
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-cyan-400 mb-2">Drop Your Bot Files Here</h3>
          <p className="text-gray-400 font-mono text-sm mb-4">
            Supports .dbot and .xml files
          </p>
          <button className="px-6 py-2 border-2 border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black transition-all">
            Or Click to Browse
          </button>
        </div>

        {/* Published Bots Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Published Bots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Trend Follower Bot', desc: 'Follows market trends automatically' },
              { name: 'Scalper Pro', desc: 'High-frequency scalping strategy' },
              { name: 'Volatility Hunter', desc: 'Trades high volatility breakouts' }
            ].map((bot, i) => (
              <BotCard key={i} bot={bot} />
            ))}
          </div>
        </div>

        {/* Your Bots */}
        {bots.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-pink-500 mb-6">Your Bots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map(bot => (
                <div key={bot.id} className="card p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{bot.name}</h3>
                  <p className="text-gray-400 font-mono text-sm mb-4">
                    Size: {bot.size} KB<br />
                    Uploaded: {bot.uploadedAt}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 border border-cyan-400 text-cyan-400 font-mono text-sm hover:bg-cyan-400 hover:text-black transition-all">
                      Load
                    </button>
                    <button className="flex-1 px-4 py-2 border border-pink-500 text-pink-500 font-mono text-sm hover:bg-pink-500 hover:text-black transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
