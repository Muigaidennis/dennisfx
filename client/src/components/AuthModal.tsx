interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle auth logic here
    alert(isSignup ? 'Signup successful!' : 'Login successful!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="card p-8 max-w-md w-full">
        <h2 className="text-2xl font-black text-pink-500 mb-6 text-center">
          {isSignup ? 'CREATE ACCOUNT' : 'LOGIN'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-cyan-400 font-mono text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-cyan-500 rounded text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-cyan-400 font-mono text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-cyan-500 rounded text-white font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-black transition-all"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 font-mono text-sm mb-4">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-cyan-400 hover:text-pink-500 transition-colors font-mono text-sm"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 border border-gray-600 text-gray-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
