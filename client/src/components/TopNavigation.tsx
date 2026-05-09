import { useState } from 'react'
import RiskDisclaimerModal from './RiskDisclaimerModal'

export default function TopNavigation() {
  const [showRiskDisclaimer, setShowRiskDisclaimer] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-cyan-500"
           style={{ boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #ff006e, #00f5ff)',
                  textShadow: '0 0 20px rgba(255, 0, 110, 0.6)'
                }}>
              DennisFX
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-cyan-400 hover:text-pink-500 transition-colors text-sm font-mono">
              Dashboard
            </a>
            <a href="/bot-builder" className="text-cyan-400 hover:text-pink-500 transition-colors text-sm font-mono">
              Bot Builder
            </a>
            <a href="/analysis" className="text-cyan-400 hover:text-pink-500 transition-colors text-sm font-mono">
              AI Analysis
            </a>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Risk Disclaimer */}
            <button
              onClick={() => setShowRiskDisclaimer(true)}
              className="text-xs font-mono text-gray-400 hover:text-pink-500 transition-colors px-3 py-2 border border-gray-600 rounded"
            >
              Risk Disclaimer
            </button>

            {/* Withdraw/Deposit */}
            <button className="text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors px-3 py-2 border border-gray-600 rounded">
              Withdraw/Deposit
            </button>

            {/* Support Links */}
            <a href="https://t.me/dennisfx" target="_blank" rel="noopener noreferrer"
               className="text-xs font-mono text-cyan-400 hover:text-pink-500 transition-colors px-3 py-2 border border-cyan-500 rounded"
               style={{ boxShadow: '0 0 10px rgba(0, 245, 255, 0.2)' }}>
              Telegram
            </a>

            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"
               className="text-xs font-mono text-green-400 hover:text-pink-500 transition-colors px-3 py-2 border border-green-600 rounded">
              WhatsApp
            </a>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors px-3 py-2"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* Risk Disclaimer Modal */}
      {showRiskDisclaimer && (
        <RiskDisclaimerModal onClose={() => setShowRiskDisclaimer(false)} />
      )}
    </>
  )
}
