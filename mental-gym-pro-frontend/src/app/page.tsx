export const metadata = {
  title: 'MentalGym Pro - Transforma tu mente y cuerpo',
  description: 'La plataforma definitiva para el desarrollo mental y físico',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <section className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Potencia tu <span className="text-indigo-600">mente</span>, 
            transforma tu <span className="text-indigo-600">cuerpo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            MentalGym Pro combina neurociencia y fitness para ofrecerte el entrenamiento 
            cognitivo más avanzado junto a rutinas físicas personalizadas.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20 w-full max-w-6xl">
          {[
            {
              icon: '🧠',
              title: 'Entrenamiento Cognitivo',
              description: 'Ejercicios basados en neurociencia para mejorar memoria y concentración'
            },
            {
              icon: '💪',
              title: 'Rutinas Personalizadas',
              description: 'Planes de ejercicio adaptados a tus objetivos físicos'
            },
            {
              icon: '📊',
              title: 'Seguimiento Integral',
              description: 'Monitoriza tu progreso mental y físico en un solo lugar'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para comenzar?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Descubre cómo MentalGym Pro puede ayudarte a alcanzar tu máximo potencial
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#beneficios"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Conoce más
            </a>
            <a
              href="#testimonios"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Historias de éxito
            </a>
          </div>
        </div>
      </section>

      {/* Additional Sections */}
      <section id="beneficios" className="py-20 bg-white">
        {/* Beneficios content here */}
      </section>

      <section id="testimonios" className="py-20 bg-gray-50">
        {/* Testimonios content here */}
      </section>
    </main>
  )
}