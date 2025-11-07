"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Search, User, Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export function SiteHeader() {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    
    setDarkMode(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const router = useRouter()
  const pathname = usePathname()

  const nav = [
    { href: "/", label: "Home" },
    { href: "/articles", label: "Articles" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact Us" },
  ]

  const linkClass = (href: string) => {
    const active = pathname === href
    return [
      "text-sm font-medium transition-colors",
      active
        ? "text-brand-700 dark:text-brand-300"
        : "text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400",
    ].join(" ")
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/placeholder-logo.png"
              alt="Tuganire News logo"
              width={40}
              height={40}
              className="h-8 w-8 md:h-10 md:w-10"
              priority
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Tuganire News</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={linkClass(n.href)}>
                {n.label}
              </Link>
            ))}
            <Link href="/search" className={linkClass("/search")}>
              Search
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/search")}
              className="hidden md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden md:flex"
            >
              <Link href="/auth/login" aria-label="Login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="transition-transform hover:scale-110"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-800">
            <nav className="flex flex-col gap-3">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`${linkClass(n.href)} py-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href="/search"
                className={`${linkClass("/search")} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Search
              </Link>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

