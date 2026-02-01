import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quant Research Dashboard',
  description: 'Professional-grade quantitative finance analytics and portfolio insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="animated-gradient">
        {children}
      </body>
    </html>
  )
}
