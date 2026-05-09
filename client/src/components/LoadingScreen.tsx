interface LoadingScreenProps {
  progress: number
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 245, 255, 0.05) 25%, rgba(0, 245, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 245, 255, 0.05) 75%, rgba(0, 245, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 245, 255, 0.05) 25%, rgba(0, 245, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 245, 255, 0.05) 75%, rgba(0, 245, 255, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo/Branding */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(135deg, #ff006e, #00f5ff)',
                textShadow: '0 0 40px rgba(255, 0, 110, 0.8), 0 0 20px rgba(0, 245, 255, 0.6)',
                letterSpacing: '4px'
              }}>
            DENNISFX
          </h1>
          <p className="text-cyan-400 text-sm mt-2 tracking-widest" style={{ textShadow: '0 0 10px rgba(0, 245, 255, 0.5)' }}>
            TRADING SIGNALS SYSTEM
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="mb-8">
          <div className="w-32 h-32 border-2 border-cyan-500 rounded-full mx-auto animate-spin"
               style={{
                 borderTopColor: '#ff006e',
                 boxShadow: '0 0 30px rgba(0, 245, 255, 0.5), inset 0 0 30px rgba(255, 0, 110, 0.2)'
               }}></div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-6">
          <div className="bg-gray-800 rounded-full h-2 overflow-hidden border border-cyan-500"
               style={{ boxShadow: '0 0 15px rgba(0, 245, 255, 0.3)' }}>
            <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-300"
                 style={{ width: `${progress}%`, boxShadow: '0 0 20px rgba(255, 0, 110, 0.8)' }}></div>
          </div>
        </div>

        {/* Status Text */}
        <p className="text-gray-400 text-sm tracking-widest">
          {progress < 30 && 'Initializing Deriv Connection...'}
          {progress >= 30 && progress < 60 && 'Loading Market Signals...'}
          {progress >= 60 && progress < 90 && 'Syncing Bot Database...'}
          {progress >= 90 && 'Ready to Trade'}
        </p>

        {/* Progress Percentage */}
        <p className="text-cyan-400 text-2xl font-mono mt-4" style={{ textShadow: '0 0 10px rgba(0, 245, 255, 0.7)' }}>
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}
