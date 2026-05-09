import { useState, useEffect } from 'react'
import { Route, Switch } from 'wouter'
import LoadingScreen from './components/LoadingScreen'
import TopNavigation from './components/TopNavigation'
import Dashboard from './pages/Dashboard'
import BotBuilder from './pages/BotBuilder'
import AdminPanel from './pages/AdminPanel'
import AIAnalysis from './pages/AIAnalysis'
import Home from './pages/Home'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    // Simulate loading with WebSocket connection
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 30
      })
    }, 300)

    // Complete loading after 3 seconds
    const timeout = setTimeout(() => {
      setLoadingProgress(100)
      setTimeout(() => setIsLoading(false), 500)
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />
  }

  return (
    <div className="min-h-screen bg-black">
      <TopNavigation />
      <main className="pt-20">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/bot-builder" component={BotBuilder} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/analysis" component={AIAnalysis} />
        </Switch>
      </main>
    </div>
  )
}

export default App
