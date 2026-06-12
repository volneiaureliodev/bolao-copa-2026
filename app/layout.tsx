import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Bolão Copa 2026',
  description: 'Faça seus palpites e dispute com os amigos na Copa do Mundo 2026!',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let user = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase não configurado ainda
  }

  const isAdmin =
    !!user &&
    !!process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
    user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header userEmail={user?.email} isAdmin={isAdmin} />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-xs text-gray-400 py-6 mt-8 border-t">
          Bolão Copa 2026 · Feito com ❤️ para os amigos
        </footer>
      </body>
    </html>
  )
}
