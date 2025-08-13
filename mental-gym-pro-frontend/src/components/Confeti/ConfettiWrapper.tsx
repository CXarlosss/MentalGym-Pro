// components/ConfettiWrapper.jsx
'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Importación dinámica para asegurar que se carga en el cliente
const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

export default function ConfettiWrapper({ active }: { active: boolean }) {
  const [windowDimension, setWindowDimension] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Solo se ejecuta en el cliente
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  if (!active || windowDimension.width === 0) {
    return null
  }

  return (
    <Confetti
      width={windowDimension.width}
      height={windowDimension.height}
      numberOfPieces={200}
      colors={['#8b5cf6', '#d8b4fe', '#ffffff', '#eab308']}
      recycle={false}
    />
  )
}