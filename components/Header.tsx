'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userEmail?: string | null
  isAdmin?: boolean
}

export default function Header({ userEmail, isAdmin }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`transition-colors hover:text-yellow-300 ${
        pathname === href ? 'text-yellow-300 font-semibold' : ''
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="bg-green-700 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-2 shrink-0">
          ⚽ <span className="hidden sm:inline">Bolão Copa 2026</span>
        </Link>

        <nav className="flex items-center flex-wrap justify-end gap-x-4 gap-y-1 text-sm">
          {navLink('/ranking', 'Ranking')}

          {userEmail ? (
            <>
              {navLink('/palpites', 'Meus Palpites')}
              {isAdmin && navLink('/admin', '⚙️ Admin')}
              <button
                onClick={handleLogout}
                className="bg-white text-green-700 px-3 py-1 rounded font-semibold hover:bg-yellow-300 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-yellow-300 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="bg-yellow-400 text-green-800 px-3 py-1 rounded font-semibold hover:bg-yellow-300 transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
