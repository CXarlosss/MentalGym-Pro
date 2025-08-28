import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">
          Términos de Servicio
        </h1>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Última actualización: 28 de agosto de 2025
        </p>

        <section className="mt-8 space-y-6 text-sm">
          <p>
            Bienvenido a **[Nombre de tu empresa/aplicación]**. Estos Términos de Servicio  rigen el uso de nuestra aplicación web y los servicios relacionados. Al acceder o utilizar nuestra aplicación, usted acepta estar obligado por estos Términos y todas las políticas incorporadas por referencia.
          </p>

          <h2 className="text-xl font-semibold mt-6">1. Aceptación de los Términos</h2>
          <p>
            Al crear una cuenta, acceder o usar la aplicación de cualquier manera, usted confirma que ha leído, entendido y aceptado estos Términos. Si no está de acuerdo con alguna parte de los Términos, no debe usar nuestra aplicación.
          </p>

          <h2 className="text-xl font-semibold mt-6">2. Uso de la Aplicación</h2>
          <p>
            Nuestra aplicación está diseñada para ayudarle a gestionar descripción corta de la funcionalidad, ej. sus hábitos de salud y bienestar compromete a usar la aplicación únicamente para fines legales y de manera que no infrinja los derechos de otros usuarios.
          </p>

          <h2 className="text-xl font-semibold mt-6">3. Cuentas de Usuario</h2>
          <p>
            Usted es responsable de mantener la confidencialidad de su contraseña y de toda la actividad que ocurra bajo su cuenta. Nos reservamos el derecho de suspender o cancelar su cuenta si sospechamos un uso no autorizado.
          </p>

          <h2 className="text-xl font-semibold mt-6">4. Propiedad Intelectual</h2>
          <p>
            Todo el contenido de la aplicación, incluyendo textos, gráficos, logotipos, iconos, imágenes, clips de audio y software, es propiedad de **[Nombre de tu empresa/aplicación]** o de sus licenciantes y está protegido por las leyes de propiedad intelectual.
          </p>
          
          <h2 className="text-xl font-semibold mt-6">5. Limitación de Responsabilidad</h2>
          <p>
            La aplicación se proporciona tal y como esy sin garantías de ningún tipo. No seremos responsables de ningún daño, directo o indirecto, que pueda derivarse del uso de la aplicación.
          </p>

          <p className="mt-6">
            Para cualquier pregunta sobre estos Términos, por favor contáctenos en <a href="mailto:soporte@mentalgym.pro" className="text-indigo-600 hover:underline">soporte@mentalgym.pro</a>.
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