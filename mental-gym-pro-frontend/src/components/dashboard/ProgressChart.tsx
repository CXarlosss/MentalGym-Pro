// src/components/dashboard/ProgressChart.tsx
'use client'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

// Carga dinámica de Line (solo en cliente)
const Line = dynamic(() => import('react-chartjs-2').then(m => m.Line), { ssr: false })

// Registra los módulos de Chart.js en cliente
let registered = false
function useRegisterChartJs() {
  useEffect(() => {
    if (registered) return
    ;(async () => {
      const ChartJS = await import('chart.js')
      const { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } = ChartJS
      Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
      registered = true
    })()
  }, [])
}

export default function ProgressChart({ data }: { data: number[] }) {
  useRegisterChartJs()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  }

  const chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Puntuación',
        data,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#6366F1',
        pointBorderWidth: 2,
      },
    ],
  }

  return <Line options={options} data={chartData} />
}
