'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './ThemeProvider'

export function Navbar() {
    const pathname = usePathname()
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/problems', label: 'Problems' },
        { href: '/categories', label: 'Categories' },
        { href: '/levels', label: 'Levels' },
        { href: '/topics', label: 'Topics' },
        { href: '/about', label: 'About' },
    ]

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 dark:bg-[#09090b]/80 dark:border-white/5">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">⚡</span>
                        </div>
                        <span className="font-semibold text-lg text-gray-900 dark:text-white">
                            Letuscrack
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-white/10'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-48 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-lg focus:w-64 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:bg-black/50 outline-none"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                <path strokeWidth="2" d="m21 21-4.3-4.3" />
                            </svg>
                        </div>
                    </form>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileMenuOpen ? (
                                <path d="M18 6 6 18M6 6l12 12" />
                            ) : (
                                <path d="M4 12h16M4 6h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium ${pathname === link.href
                                        ? 'bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white'
                                        : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <form onSubmit={handleSearch} className="mt-3 px-4">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-900 dark:bg-white/5 dark:border-white/10 dark:text-white"
                                />
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
