import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Rally — Road Enthusiast',
  description: 'Connect with fellow enthusiasts. Create and join scenic drives.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-base text-white font-sans antialiased">
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
      </body>
    </html>
  )
}
