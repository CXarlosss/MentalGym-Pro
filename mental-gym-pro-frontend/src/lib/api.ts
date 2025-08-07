// src/lib/api.ts
import type { 
  Exercise, 
  Challenge,  // Importamos Challenge desde los tipos
  UserProgress,
  ExerciseResult
} from '@/types'

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
    updatedAt: '2023-05-16T12:00:00Z'
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
    updatedAt: '2023-05-16T12:00:00Z'
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
    updatedAt: '2023-05-16T12:00:00Z'
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
    updatedAt: '2023-05-16T12:00:00Z'
  },
];

// Datos de progreso de usuario simulados
const mockUserProgress: UserProgress = {
  weeklyData: [5, 8, 12, 10, 15, 18, 20],
  streak: 7,
  totalExercises: 45,
  averageScore: 85,
};

// Desafíos activos simulados
const mockActiveChallenges: Challenge[] = [
  {
    _id: 'ch-1',
    title: 'Maratón de Memoria',
    description: 'Supera 50 niveles del juego de memoria para unirte al podio.',
    objective: "Completar 50 niveles",
    durationDays: 30,
    isCompleted: false,
    exercises: ['1', '2', '3'],
    expiresAt: '2025-09-01T00:00:00Z',
    participants: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'ch-2',
    title: 'El Lógico',
    description: 'Resuelve 20 enigmas de lógica en el menor tiempo posible.',
    objective: "Resolver 20 enigmas",
    durationDays: 15,
    isCompleted: false,
    exercises: ['4', '5'],
    expiresAt: '2025-08-25T23:59:59Z',
    participants: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'ch-3',
    title: 'Atención al Detalle',
    description: 'Encuentra las diferencias en imágenes complejas.',
    objective: "Completar 30 niveles",
    durationDays: 7,
    isCompleted: false,
    exercises: ['6', '7'],
    expiresAt: '', // Cadena vacía para desafíos sin fecha de expiración
    participants: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

// ==============================================
//           FUNCIONES DE LA API
// ==============================================
export const fetchExercises = async (): Promise<Exercise[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockExercises;
};

export const login = async (email: string, password: string): Promise<{ token: string }> => {
  if (email === 'test@example.com' && password === '123456') {
    return { token: 'fake-jwt-token' };
  }
  throw new Error('Credenciales inválidas');
};

export const fetchExerciseCategories = async (): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return Array.from(new Set(mockExercises.map(ex => ex.category)));
};

export const fetchUserProgress = async (): Promise<UserProgress> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockUserProgress;
};

export const fetchActiveChallenges = async (): Promise<Challenge[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockActiveChallenges;
};

export const fetchRecentExercises = async (limit: number): Promise<Exercise[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockExercises.slice(0, limit);
};

export const fetchExerciseById = async (id: string): Promise<Exercise> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (Math.random() < 0.1) {
    throw new Error('Simulación de error de red o servidor.');
  }
  
  const exercise = mockExercises.find(ex => ex._id === id);
  if (!exercise) {
    throw new Error(`Exercise with ID '${id}' not found.`);
  }
  return exercise;
};

export const startExerciseSession = async (exerciseId: string): Promise<{ _id: string }> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Simulando inicio de sesión para el ejercicio ${exerciseId}`);
  return { _id: `sess_${Math.random().toString(36).slice(2, 11)}` };
};

export const completeExercise = async (
  sessionId: string,
  data: {
    score: number;
    timeSpent: number;
    metadata: Record<string, unknown>;
  }
): Promise<ExerciseResult> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (!sessionId || !sessionId.startsWith('sess_')) {
    throw new Error('Invalid sessionId.');
  }
  
  console.log(`Simulando finalización de sesión ${sessionId} con datos:`, data);
  
  return {
    _id: `res_${Math.random().toString(36).slice(2, 11)}`,
    sessionId,
    score: data.score,
    timeSpent: data.timeSpent,
    createdAt: new Date().toISOString(),
    metadata: data.metadata,
  };
};