import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Pixel UI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">Design faster with AI-powered workflows and modern components.</p>
            <div className="flex items-center gap-3">
              <Link href="https://github.com" target="_blank" className="p-2 rounded-md hover:bg-muted transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="p-2 rounded-md hover:bg-muted transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="p-2 rounded-md hover:bg-muted transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features-section" className="hover:text-primary">Features</a></li>
              <li><a href="#" className="hover:text-primary">Pricing</a></li>
              <li><a href="#" className="hover:text-primary">Changelog</a></li>
              <li><a href="#" className="hover:text-primary">Roadmap</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wide">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Docs</a></li>
              <li><a href="#" className="hover:text-primary">Guides</a></li>
              <li><a href="#" className="hover:text-primary">Community</a></li>
              <li><a href="#" className="hover:text-primary">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Pixel UI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
