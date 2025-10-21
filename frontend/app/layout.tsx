"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import Web3Provider from "@/providers/Web3Provider";
import WalletConnector from "@/components/WalletConnector";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [meDropdownOpen, setMeDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/create", label: "Create" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/admin", label: "Admin" },
  ];

  const meLinks = [
    { href: "/my-campaigns", label: "My Campaigns" },
    { href: "/badges", label: "My Badges" },
  ];

  const isActive = (href: string) => pathname === href;
  const isMeActive = meLinks.some(link => pathname === link.href);

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1020] overflow-x-hidden`}
      >
        <Web3Provider>
          <div className="min-h-screen flex flex-col relative">


            {/* EPIC Header */}
            <header 
              className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled 
                  ? 'bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/5' 
                  : 'bg-transparent'
              }`}
            >
              
              <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-24">
                  {/* MEGA Logo */}
                  <Link 
                    href="/" 
                    className="flex items-center gap-4 group relative z-10"
                  >
                    <div className="relative">
                      {/* Logo container - clean */}
                      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#2AB56F] p-[1px] transform group-hover:scale-105 transition-all duration-200">
                        <div className="w-full h-full bg-[#0B1020] rounded-xl flex items-center justify-center">
                          <img 
                            src="/logo.svg" 
                            alt="PulseAid" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Brand text */}
                    <div className="hidden sm:block">
                      <h1 className="text-xl font-bold text-white">
                        PulseAid
                      </h1>
                      <p className="text-xs text-gray-400">
                        Celo Powered
                      </p>
                    </div>
                  </Link>

                  {/* EPIC Desktop Navigation */}
                  <nav className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-full p-2 border border-white/10">
                    {navLinks.map((link) => {
                      const active = isActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="relative group"
                        >
                          {/* Active indicator */}
                          {active && (
                            <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F] to-[#2AB56F] rounded-full" />
                          )}
                          
                          <div className={`relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                            active 
                              ? 'text-black' 
                              : 'text-gray-400 hover:text-white'
                          }`}>
                            <span className="relative z-10">{link.label}</span>
                            
                            {/* Hover effect */}
                            {!active && (
                              <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    
                    {/* Me Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setMeDropdownOpen(!meDropdownOpen)}
                        className="relative group"
                      >
                        {/* Active indicator */}
                        {isMeActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F] to-[#2AB56F] rounded-full" />
                        )}
                        
                        <div className={`relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                          isMeActive 
                            ? 'text-black' 
                            : 'text-gray-400 hover:text-white'
                        }`}>
                          <span className="relative z-10">Me</span>
                          <svg className={`w-4 h-4 transition-transform duration-300 ${meDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          
                          {/* Hover effect */}
                          {!isMeActive && (
                            <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          )}
                        </div>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {meDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#0B1020]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl z-50">
                          {meLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMeDropdownOpen(false)}
                              className={`block px-4 py-3 hover:bg-white/10 transition-all duration-200 ${
                                pathname === link.href ? 'bg-white/5 text-[#35D07F]' : 'text-gray-300'
                              }`}
                            >
                              <span className="font-medium">{link.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </nav>

                  {/* Right side with epic styling */}
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                      <WalletConnector />
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="lg:hidden relative group"
                      aria-label="Toggle menu"
                    >
                      <div className="relative p-3 rounded-2xl bg-gradient-to-br from-[#35D07F] to-[#FCFF52] hover:scale-105 transition-transform duration-200">
                        <div className="w-6 h-6 flex flex-col items-center justify-center gap-1.5">
                          <span 
                            className={`w-6 h-0.5 bg-black rounded-full transition-all duration-500 ${
                              mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                            }`}
                          />
                          <span 
                            className={`w-6 h-0.5 bg-black rounded-full transition-all duration-300 ${
                              mobileMenuOpen ? 'opacity-0 scale-0' : ''
                            }`}
                          />
                          <span 
                            className={`w-6 h-0.5 bg-black rounded-full transition-all duration-500 ${
                              mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* EPIC Mobile Menu */}
              <div 
                className={`lg:hidden absolute top-full left-0 w-full transition-all duration-700 ease-out ${
                  mobileMenuOpen 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}
              >
                <div className="bg-[#0B1020]/95 backdrop-blur-2xl border-t border-white/5 shadow-2xl">
                  <div className="container mx-auto px-4 py-8">
                    {/* Mobile Wallet */}
                    <div className="sm:hidden mb-6">
                      <WalletConnector />
                    </div>
                    
                    {/* Mobile Nav Links */}
                    <div className="space-y-3">
                      {navLinks.map((link, index) => {
                        const active = isActive(link.href);
                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            className="block group"
                            style={{ 
                              animationDelay: `${index * 75}ms`,
                              animation: mobileMenuOpen ? 'slideInUp 0.5s ease-out forwards' : 'none',
                              opacity: 0
                            }}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                              active 
                                ? 'bg-gradient-to-r from-[#35D07F] to-[#FCFF52]' 
                                : 'bg-white/5 hover:bg-white/10'
                            }`}>
                              
                              <div className={`relative px-6 py-5 flex items-center justify-between ${
                                active ? 'bg-[#0B1020]/90' : ''
                              } rounded-2xl m-[2px]`}>
                                <span className={`text-lg font-bold transition-all duration-300 ${
                                  active 
                                    ? 'text-transparent bg-gradient-to-r from-[#35D07F] to-[#FCFF52] bg-clip-text' 
                                    : 'text-gray-300 group-hover:text-white'
                                }`}>
                                  {link.label}
                                </span>
                                <div className={`transform transition-all duration-500 ${
                                  active ? 'rotate-0 scale-110' : 'group-hover:translate-x-2'
                                }`}>
                                  {active ? (
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#35D07F] to-[#FCFF52]" />
                                  ) : (
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-[#35D07F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Backdrop overlay */}
            <div 
              className={`lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500 ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 relative z-10 pt-24">{children}</main>

            {/* Footer */}
            <footer className="relative mt-32 z-10 border-t border-white/5">
              <div className="bg-[#0B1020]">
                <div className="container mx-auto px-4 lg:px-8 py-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* MEGA Brand Column */}
                    <div className="lg:col-span-2">
                      <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#2AB56F] p-[1px]">
                          <div className="w-full h-full bg-[#0B1020] rounded-xl flex items-center justify-center">
                            <img 
                              src="/logo.svg" 
                              alt="PulseAid" 
                              className="w-7 h-7 object-contain"
                            />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          PulseAid
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-md mb-6">
                        Humanitarian aid powered by blockchain technology.
                      </p>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 w-fit">
                        <div className="w-2 h-2 rounded-full bg-[#35D07F]" />
                        <span className="text-xs text-gray-400">
                          EthNile 2025
                        </span>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div>
                      <h4 className="text-sm font-bold text-white mb-4">
                        Navigation
                      </h4>
                      <div className="space-y-4">
                        {navLinks.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            className="group flex items-center gap-3 text-gray-400 hover:text-[#35D07F] transition-all duration-300"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#35D07F] group-hover:w-8 transition-all duration-500" />
                            <span className="font-medium">{link.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <h4 className="text-sm font-black text-white mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-8 h-[2px] bg-gradient-to-r from-[#FCFF52] to-transparent" />
                        Built With
                      </h4>
                      <div className="space-y-4">
                        <a 
                          href="https://nilebitlabs.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 text-gray-400 hover:text-[#35D07F] transition-all duration-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#35D07F] group-hover:w-8 transition-all duration-500" />
                          <span className="font-bold">NileBit Labs</span>
                        </a>
                        <div className="flex flex-wrap gap-2 ml-5">
                          {[
                            { label: 'Celo', color: 'from-[#35D07F] to-[#35D07F]' },
                            { label: 'Web3', color: 'from-purple-400 to-pink-400' }
                          ].map((tech) => (
                            <div key={tech.label} className="group relative">
                              <div className="relative px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                                <span className={`text-xs font-medium bg-gradient-to-r ${tech.color} bg-clip-text text-transparent`}>
                                  {tech.label}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EPIC Bottom Bar */}
                  <div className="pt-10 border-t border-white/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <p className="text-sm text-gray-500 text-center md:text-left">
                        © 2025 PulseAid. 
                        <span className="mx-2 text-[#35D07F] font-bold">Onchain Hope.</span>
                        <span className="text-[#FCFF52] font-bold">Real Impact.</span>
                      </p>
                      <div className="flex items-center gap-6">
                        {['Privacy', 'Terms', 'Contact'].map((item) => (
                          <a 
                            key={item}
                            href="#" 
                            className="text-sm text-gray-500 hover:text-[#35D07F] transition-colors duration-300 font-medium relative group"
                          >
                            {item}
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#35D07F] to-[#FCFF52] group-hover:w-full transition-all duration-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Web3Provider>

        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </body>
    </html>
  );
}