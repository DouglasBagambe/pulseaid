import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "PulseAid - Blockchain Hope. Real Impact.",
  description: "Transparent crowdfunding for real human crises in Africa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1020]`}
      >
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            {/* Header with Glass Morphism */}
            <header className="sticky top-0 z-50 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <a href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#35D07F] to-[#FCFF52] rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#35D07F] to-[#FCFF52] flex items-center justify-center">
                        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <h1 className="text-xl font-bold text-white group-hover:text-[#35D07F] transition-colors duration-300">
                        PulseAid
                      </h1>
                      <p className="text-xs text-gray-500">Celo Powered</p>
                    </div>
                  </a>

                  {/* Desktop Navigation */}
                  <nav className="hidden lg:flex items-center gap-1">
                    <a
                      href="/"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                      Home
                    </a>
                    <a
                      href="/create"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                      Create
                    </a>
                    <a
                      href="/badges"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                      Badges
                    </a>
                    <a
                      href="/admin"
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                    >
                      Admin
                    </a>
                  </nav>

                  {/* Wallet Connector */}
                  <div className="flex items-center gap-3">
                    <WalletConnector />
                    
                    {/* Mobile Menu Button */}
                    <button className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  <a
                    href="/"
                    className="flex-1 min-w-[120px] px-4 py-2 rounded-xl text-sm font-medium text-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    Home
                  </a>
                  <a
                    href="/create"
                    className="flex-1 min-w-[120px] px-4 py-2 rounded-xl text-sm font-medium text-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    Create
                  </a>
                  <a
                    href="/badges"
                    className="flex-1 min-w-[120px] px-4 py-2 rounded-xl text-sm font-medium text-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    Badges
                  </a>
                  <a
                    href="/admin"
                    className="flex-1 min-w-[120px] px-4 py-2 rounded-xl text-sm font-medium text-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-300"
                  >
                    Admin
                  </a>
                </nav>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer with Gradient Border */}
            <footer className="relative mt-20">
              {/* Gradient Border Top */}
              <div className="h-px bg-gradient-to-r from-transparent via-[#35D07F]/50 to-transparent" />
              
              <div className="bg-[#0B1020]/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand Column */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#35D07F] to-[#FCFF52]" />
                        <h3 className="text-lg font-bold text-white">PulseAid</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Transparent, blockchain-powered crowdfunding for real human crises across Africa.
                      </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
                      <div className="space-y-2">
                        <a href="/" className="block text-sm text-gray-400 hover:text-[#35D07F] transition-colors duration-300">
                          Home
                        </a>
                        <a href="/create" className="block text-sm text-gray-400 hover:text-[#35D07F] transition-colors duration-300">
                          Create Campaign
                        </a>
                        <a href="/badges" className="block text-sm text-gray-400 hover:text-[#35D07F] transition-colors duration-300">
                          My Badges
                        </a>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-4">Built With</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#35D07F]/10 border border-[#35D07F]/20 text-xs text-[#35D07F] font-medium">
                          Celo
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#FCFF52]/10 border border-[#FCFF52]/20 text-xs text-[#FCFF52] font-medium">
                          AI Powered
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-medium">
                          Next.js
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-gray-500 text-center md:text-left">
                        © 2025 PulseAid. Blockchain Hope. Real Impact.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                          <div className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse" />
                          <span className="text-xs text-gray-400">Built for EthNile 2025</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}