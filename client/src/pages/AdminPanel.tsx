import { useState } from 'react'

export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword] = useState(process.env.REACT_APP_ADMIN_PASSWORD || 'admin123')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setPassword('')
    } else {
      alert('Invalid password')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="card p-12 max-w-md w-full">
          <h1 className="text-3xl font-black text-pink-500 mb-8 text-center">ADMIN ACCESS</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-cyan-400 font-mono text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-cyan-500 rounded text-white font-mono"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-black transition-all"
            >
              Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-pink-500 mb-2">ADMIN PANEL</h1>
          <p className="text-gray-400 font-mono">Manage published bots and platform settings</p>
        </div>

        {/* Upload Bot Section */}
        <div className="card p-8 mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Upload New Bot</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-400 font-mono text-sm mb-2">Bot Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-900 border border-cyan-500 rounded text-white font-mono"
                placeholder="e.g., Trend Follower Bot"
              />
            </div>
            <div>
              <label className="block text-cyan-400 font-mono text-sm mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2 bg-gray-900 border border-cyan-500 rounded text-white font-mono"
                rows={3}
                placeholder="Describe what this bot does..."
              ></textarea>
            </div>
            <div>
              <label className="block text-cyan-400 font-mono text-sm mb-2">Bot File</label>
              <input
                type="file"
                accept=".dbot,.xml"
                className="w-full px-4 py-2 bg-gray-900 border border-cyan-500 rounded text-white font-mono"
              />
            </div>
            <button className="w-full px-6 py-3 border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-black transition-all">
              Publish Bot
            </button>
          </div>
        </div>

        {/* Manage Bots */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Published Bots</h2>
          <div className="space-y-4">
            {[
              { name: 'Trend Follower Bot', status: 'Active', users: 234 },
              { name: 'Scalper Pro', status: 'Active', users: 156 },
              { name: 'Volatility Hunter', status: 'Active', users: 89 }
            ].map((bot, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-900 border border-cyan-500 rounded">
                <div>
                  <h3 className="font-bold text-cyan-400">{bot.name}</h3>
                  <p className="text-gray-400 font-mono text-sm">{bot.users} users • {bot.status}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-cyan-400 text-cyan-400 font-mono text-sm hover:bg-cyan-400 hover:text-black transition-all">
                    Edit
                  </button>
                  <button className="px-4 py-2 border border-pink-500 text-pink-500 font-mono text-sm hover:bg-pink-500 hover:text-black transition-all">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
