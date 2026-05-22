import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ff1493' }}>
          DennisFX
        </h1>
        <p style={{ fontSize: '20px', marginBottom: '30px', color: '#00ffff' }}>
          Premium Trading Signals Platform
        </p>
        <button
          onClick={() => setCount((count) => count + 1)}
          style={{
            backgroundColor: '#ff1493',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App
