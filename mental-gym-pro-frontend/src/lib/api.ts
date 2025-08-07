/**
 * @fileoverview Este archivo simula un servicio de API backend para el desarrollo
 * de la aplicación. Todas las funciones aquí son asíncronas y simulan
 * la latencia de red y posibles errores para probar la UI de forma aislada.
 */

// ==============================================
//           INTERFACES DE DATOS
// ==============================================

/** Define la estructura de un ejercicio. */
export interface Exercise {
  _id: string;
  title: string;
  description: string;
  category: 'memoria' | 'logica' | 'atencion' | 'calculo';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // Duración en minutos
  instructions: string[];
  createdAt: string;
    updatedAt: string

}

/** Define la estructura del resultado de un ejercicio. */
export interface ExerciseResult {
  _id: string;
  sessionId: string;
  score: number; // Por ejemplo, puntos obtenidos
  timeSpent: number; // Tiempo en segundos
  createdAt: string;
  metadata: Record<string, unknown>; // Datos adicionales
}

/** Define la estructura del progreso del usuario. */
export interface UserProgress {
  weeklyData: number[] // Progreso por cada día de la semana
  streak: number
  totalExercises: number
  averageScore: number
}


/** Define la estructura de un desafío activo. */
export interface Challenge {
  _id: string;
  title: string;
  description: string;
  expiresAt: string;
  participants: number;
}

// ==============================================
//             DATOS DE EJEMPLO
// ==============================================

// Lista de ejercicios de ejemplo
const mockExercises: Exercise[] = [
  {
    _id: '1',
    title: 'Memoria de Números',
    description: 'Recuerda y repite secuencias numéricas de longitud creciente',
    category: 'memoria',
    difficulty: 'easy',
    duration: 5,
    
    instructions: [
      'Memoriza el número que aparecerá en pantalla.',
      'Espera a que desaparezca.',
      'Ingresa el número exacto que viste.',
      'Cada ronda aumenta la dificultad.',
      'Completa 5 rondas para finalizar.'
    ],
    createdAt: '2023-05-15T10:00:00Z',
        updatedAt: '2023-05-16T12:00:00Z', // ✅ Añadir esto

  },
  {
    _id: '2',
    title: 'Búsqueda Rápida de Patrones',
    description: 'Encuentra el patrón que no encaja en una serie de imágenes.',
    category: 'atencion',
    difficulty: 'medium',
    duration: 8,
    instructions: [
      'Se mostrarán 9 imágenes con patrones.',
      'Uno de los patrones es diferente al resto.',
      'Haz clic en la imagen que contenga el patrón único.',
      'Tienes 10 segundos por ronda para encontrarlo.',
      'Completa 10 rondas para finalizar el ejercicio.'
    ],
    createdAt: '2023-06-20T12:30:00Z',
            updatedAt: '2023-05-16T12:00:00Z', // ✅ Añadir esto

  },
  {
    _id: '3',
    title: 'Cálculo Mental Avanzado',
    description: 'Resuelve operaciones matemáticas complejas en poco tiempo.',
    category: 'calculo',
    difficulty: 'hard',
    duration: 10,
    instructions: [
      'Se te presentarán ecuaciones matemáticas con un tiempo limitado.',
      'Las operaciones incluyen suma, resta, multiplicación y división.',
      'Ingresa la respuesta correcta tan rápido como puedas.',
      'El tiempo se reduce en cada nivel.',
      'Completa 20 niveles para ganar.'
    ],
    createdAt: '2023-07-01T08:45:00Z',
            updatedAt: '2023-05-16T12:00:00Z', // ✅ Añadir esto

  },
  {
    _id: '4',
    title: 'Lógica del Silogismo',
    description: 'Determina si la conclusión de un silogismo es válida.',
    category: 'logica',
    difficulty: 'medium',
    duration: 7,
    instructions: [
      'Lee las dos premisas y la conclusión.',
      'Haz clic en "Válido" si la conclusión se deriva lógicamente de las premisas.',
      'Haz clic en "No Válido" si no es así.',
      'Responde a 15 silogismos para completar el desafío.'
    ],
    createdAt: '2023-08-10T14:20:00Z',
            updatedAt: '2023-05-16T12:00:00Z', // ✅ Añadir esto

  },
];

// Datos de progreso de usuario simulados
const mockUserProgress: UserProgress = {
  weeklyData: [5, 8, 12, 10, 15, 18, 20], // Ejemplo de progreso semanal
  streak: 7, // Días consecutivos
  totalExercises: 45,
  averageScore: 85,
};

// Desafíos activos simulados
const mockActiveChallenges: Challenge[] = [
  {
    _id: 'ch-1',
    title: 'Maratón de Memoria',
    description: 'Supera 50 niveles del juego de memoria para unirte al podio.',
    expiresAt: '2025-09-01T00:00:00Z',
    participants: 150,
  },
  {
    _id: 'ch-2',
    title: 'El Lógico',
    description: 'Resuelve 20 enigmas de lógica en el menor tiempo posible.',
    expiresAt: '2025-08-25T23:59:59Z',
    participants: 80,
  },
];


// ==============================================
//           FUNCIONES DE LA API
// ==============================================

/**
 * Simula la obtención del progreso de un usuario.
 * @returns {Promise<UserProgress>} El progreso del usuario.
 */
export const fetchUserProgress = async (): Promise<UserProgress> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia
  return mockUserProgress;
};

/**
 * Simula la obtención de los desafíos activos.
 * @returns {Promise<Challenge[]>} Una lista de desafíos activos.
 */
export const fetchActiveChallenges = async (): Promise<Challenge[]> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simula latencia
  return mockActiveChallenges;
};

/**
 * Simula la obtención de los ejercicios recientes del usuario.
 * @param {number} limit El número de ejercicios a devolver.
 * @returns {Promise<Exercise[]>} Una lista de ejercicios completados recientemente.
 */
export const fetchRecentExercises = async (limit: number): Promise<Exercise[]> => {
  await new Promise(resolve => setTimeout(resolve, 400)); // Simula latencia
  // Devuelve los ejercicios de ejemplo, limitados por el parámetro
  return mockExercises.slice(0, limit);
};

/**
 * Simula la obtención de un ejercicio por su ID.
 * @param {string} id El ID del ejercicio a buscar.
 * @returns {Promise<Exercise>} El ejercicio encontrado.
 * @throws {Error} Si el ejercicio no es encontrado (simulando un 404).
 */
export const fetchExerciseById = async (id: string): Promise<Exercise> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simula latencia
  
  // 1 de cada 10 peticiones fallan para simular errores de red
  if (Math.random() < 0.1) {
    throw new Error('Simulación de error de red o servidor.');
  }
  
  const exercise = mockExercises.find(ex => ex._id === id);
  if (!exercise) {
    throw new Error(`Exercise with ID '${id}' not found. (Simulating 404)`);
  }
  return exercise;
};

/**
 * Simula el inicio de una sesión de ejercicio.
 * @param {string} exerciseId El ID del ejercicio que se va a iniciar.
 * @returns {Promise<{ _id: string }>} Un objeto con el ID de la nueva sesión.
 */
export const startExerciseSession = async (exerciseId: string): Promise<{ _id: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula latencia
  
  // Se podría validar aquí si el exerciseId es válido en el futuro
  console.log(`Simulando inicio de sesión para el ejercicio ${exerciseId}`);
  
  // Devuelve un ID de sesión aleatorio para simular el backend
  return { _id: `sess_${Math.random().toString(36).substr(2, 9)}` };
};

/**
 * Simula el envío de los resultados de un ejercicio completado.
 * @param {string} sessionId El ID de la sesión de ejercicio.
 * @param {{ score: number; timeSpent: number; metadata: Record<string, unknown> }} data Los datos del resultado.
 * @returns {Promise<ExerciseResult>} El resultado del ejercicio completado.
 * @throws {Error} Si el sessionId es inválido (simulando un 400).
 */
export const completeExercise = async (
  sessionId: string,
  data: {
    score: number;
    timeSpent: number;
    metadata: Record<string, unknown>;
  }
): Promise<ExerciseResult> => {
  await new Promise(resolve => setTimeout(resolve, 400)); // Simula latencia
  
  if (!sessionId || !sessionId.startsWith('sess_')) {
    throw new Error('Invalid sessionId. (Simulating 400 Bad Request)');
  }
  
  console.log(`Simulando finalización de sesión ${sessionId} con datos:`, data);
  
  return {
    _id: `res_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: new Date().toISOString(),
    metadata: data.metadata,
  };
};
