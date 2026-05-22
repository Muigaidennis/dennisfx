import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">DennisFX</h1>
        <p className="text-xl mb-8">Premium Trading Signals Platform</p>
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded"
        >
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App
