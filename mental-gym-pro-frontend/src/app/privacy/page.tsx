import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Última actualización: 28 de agosto de 2025
        </p>

        <section className="mt-8 space-y-6 text-sm">
          <p>
            En **[Nombre de tu empresa/aplicación]**, nos comprometemos a proteger su privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos, procesamos y divulgamos su información personal en relación con su uso de nuestra aplicación.
          </p>

          <h2 className="text-xl font-semibold mt-6">1. Información que Recopilamos</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              **Información de la cuenta:** Cuando se registra, recopilamos su nombre y dirección de correo electrónico.
            </li>
            <li>
              **Datos de uso:** Recopilamos información sobre cómo interactúa con nuestra aplicación, como las sesiones que completa o las funciones que utiliza. Esto nos ayuda a mejorar nuestros servicios.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">2. Cómo Usamos la Información</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Para proporcionar, mantener y mejorar nuestra aplicación.
            </li>
            <li>
              Para comunicarnos con usted, por ejemplo, para notificarle sobre nuevas características.
            </li>
            <li>
              Para analizar el uso de la aplicación y entender las tendencias.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">3. Divulgación a Terceros</h2>
          <p>
            No vendemos ni compartimos su información personal con terceros para sus fines de marketing. Podemos divulgar su información a proveedores de servicios que nos ayudan a operar la aplicación, como servicios de alojamiento web o analíticas, bajo estrictas obligaciones de confidencialidad.
          </p>

          <h2 className="text-xl font-semibold mt-6">4. Seguridad</h2>
          <p>
            Hemos implementado medidas de seguridad diseñadas para proteger su información personal contra el acceso no autorizado, la pérdida o la alteración. Sin embargo, ningún sistema de seguridad es impenetrable.
          </p>

          <p className="mt-6">
            Si tiene preguntas sobre esta política, contáctenos en <a href="mailto:soporte@mentalgym.pro" className="text-indigo-600 hover:underline">soporte@mentalgym.pro</a>.
          </p>
        </section>
        
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}