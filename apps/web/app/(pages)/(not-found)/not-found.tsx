import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-border mx-auto">
          <span className="text-2xl font-bold">404</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Page not found
          </span>
        </h1>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
              Go Home
            </Button>
          </Link>
          <Link href="/workspace">
            <Button variant="outline" className="rounded-full px-6">
              Open Workspace
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
