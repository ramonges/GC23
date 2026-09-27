import type { Metadata } from 'next'
import { IBM_Plex_Mono, Inter_Tight } from 'next/font/google'
import './globals.css'

const grotesk = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-grotesk',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vulcan Trade — Supply-chain intelligence for the materials that build the future',
  description:
    'Vulcan Trade traces the raw materials, routes, risks, and decisions behind industrial and robotics production — from mine to machine.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
