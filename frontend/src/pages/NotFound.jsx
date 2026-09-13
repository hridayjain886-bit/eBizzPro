import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full hand-border bg-tint text-2xl font-extrabold">?</div>
      <h1 className="text-2xl font-extrabold">Page not found</h1>
      <p className="max-w-xs text-sm text-ink-soft">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/"><Button icon={Home}>Back to dashboard</Button></Link>
    </div>
  )
}
