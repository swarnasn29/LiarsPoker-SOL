"use client"

import { Home, Layers, PlayCircle, User, BookOpen } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "../utils/cn";
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: Home
  },
  {
    name: "Join",
    href: "/joingames",
    icon: Layers
  },
  {
    name: "Tutorials",
    href: "/tutorials",
    icon: PlayCircle
  },
  {
    name: "Login",
    href: "/login",
    icon: User
  },
  {
    name: "Rules",
    href: "/rules",
    icon: BookOpen
  }
]

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-24 flex-col items-center border-r border-zinc-800 bg-zinc-950/95 py-8 backdrop-blur-sm z-10 fixed top-0 left-0">
      {/* Game Logo */}
      <div className="mb-8">
        <Image src="/favicon.ico" alt="Liar's Poker" className="w-12 h-12" width={100} height={100} />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-zinc-900/50 transition-all hover:bg-[#98C23D]/20 hover:scale-105",
                isActive && "bg-[#98C23D]/20 shadow-lg shadow-[#98C23D]/20 "
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 text-zinc-400 transition-colors group-hover:text-[#98C23D]",
                  isActive && "text-[#98C23D]"
                )}
              />
              <span
                className={cn(
                  "absolute -bottom-5 text-2xl font-medium text-zinc-400 transition-colors group-hover:text-[#98C23D] text-center",
                  isActive && "text-[#98C23D]"
                )}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-[#98C23D]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Wallet Connection Section */}
      <div className="mt-auto pt-6 w-full px-3">
        <div className="wallet-adapter-button-trigger">
          <WalletMultiButton className="!bg-[#98C23D]/10 hover:!bg-[#98C23D]/20 !text-[#98C23D] hover:!text-[#98C23D] !border-[#98C23D]/30 hover:!border-[#98C23D]/50 !rounded-xl !w-full !py-3 !text-sm !font-medium !transition-all hover:!scale-105" />
        </div>
      </div>
    </div>
  )
}

