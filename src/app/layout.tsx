import type { Metadata } from 'next'
import { Noto_Sans_JP, Space_Grotesk } from 'next/font/google'
import './globals.css'

const jp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jp',
  display: 'swap',
})

const latin = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-latin',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dynamic Language',
  description: 'Aprende japonés con input comprensible y repetición espaciada',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${jp.variable} ${latin.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  )
}
