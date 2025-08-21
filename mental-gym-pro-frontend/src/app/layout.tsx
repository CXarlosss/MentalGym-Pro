// src/app/layout.tsx
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import { AuthProvider } from '@/context/AuthContext'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MentalGym Pro',
  description: 'Tu gimnasio mental',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Se elimina 'dark' de la clase del html
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}