interface RiskDisclaimerModalProps {
  onClose: () => void
}

export default function RiskDisclaimerModal({ onClose }: RiskDisclaimerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-pink-500 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
           style={{ boxShadow: '0 0 30px rgba(255, 0, 110, 0.4)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-cyan-600 p-6 border-b border-pink-500">
          <h2 className="text-2xl font-black text-white tracking-wider">RISK DISCLAIMER</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-300 font-mono text-sm leading-relaxed space-y-4">
          <p>
            <strong className="text-cyan-400">WARNING:</strong> Trading financial derivatives carries a high level of risk and may not be suitable for all investors.
          </p>

          <p>
            DennisFX provides automated trading signals and bot management tools. Past performance is not indicative of future results. All trading involves risk, including the potential loss of principal.
          </p>

          <p>
            <strong className="text-pink-400">Key Risks:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Market volatility can result in rapid and substantial losses</li>
            <li>Automated bots may not perform as expected in all market conditions</li>
            <li>Technical failures or connection issues may affect trading execution</li>
            <li>Leverage amplifies both gains and losses</li>
          </ul>

          <p>
            You acknowledge that you have read and understood this disclaimer and accept full responsibility for any losses incurred through the use of DennisFX services.
          </p>

          <p className="text-xs text-gray-500">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-4 border-t border-pink-500 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            I Understand the Risks
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
