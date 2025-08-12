'use client'
export default function Section({
  title,
  description,
  right,
  children,
}: {
  title: string
  description?: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}
