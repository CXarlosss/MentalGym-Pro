# 🧠 MentalGym Pro

**MentalGym Pro** es una plataforma web diseñada para entrenar y fortalecer la mente a través de ejercicios de concentración, memoria, lógica y hábitos de productividad.  
Incluye un **backend con Express + MongoDB** y un **frontend moderno con Next.js + Tailwind**, ofreciendo una experiencia fluida, visual y escalable.

🌐 Demo disponible en: [https://mental-gym-pro.netlify.app/](https://mental-gym-pro.netlify.app/)  
📡 Backend desplegado en: [Render](https://render.com/)

---

## 📖 Tabla de Contenidos

- [🚀 Tecnologías](#-tecnologías)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙️ Instalación y Uso](#️-instalación-y-uso)
- [🔑 Variables de Entorno](#-variables-de-entorno)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Scripts principales](#️-scripts-principales)
- [📡 API - Endpoints principales](#-api---endpoints-principales)
- [📌 Roadmap](#-roadmap)
- [🤝 Contribuciones](#-contribuciones)
- [📜 Licencia](#-licencia)

---

## 🚀 Tecnologías

### Frontend
- Next.js 15 con App Router
- React 19
- Tailwind CSS 3
- Framer Motion para animaciones
- Chart.js + react-chartjs-2 para gráficas
- Heroicons y Lucide React para iconos
- React Hot Toast para notificaciones
- React Router DOM para navegación adicional

### Backend
- Express 5 como framework principal
- MongoDB + Mongoose para base de datos
- JWT para autenticación
- Bcrypt para encriptar contraseñas
- Express Validator para validaciones
- Morgan y Cookie-Parser
- Dotenv para configuración de entornos

---

## 📂 Estructura del Proyecto

```
MentalGym-Pro/
│── frontend/          # Next.js + Tailwind (interfaz)
│   ├── app/           # Directorio principal de la aplicación
│   ├── components/    # Componentes reutilizables
│   ├── lib/           # Utilidades y configuraciones
│   ├── public/        # Archivos estáticos
│   └── styles/        # Estilos globales
│── backend/           # Express + MongoDB (API REST)
│   ├── controllers/   # Lógica de los endpoints
│   ├── models/        # Modelos de MongoDB
│   ├── routes/        # Definición de rutas
│   ├── middleware/    # Middlewares personalizados
│   └── utils/         # Utilidades del servidor
│── README.md
```

---

## ⚙️ Instalación y Uso

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/CXarlosss/MentalGym-Pro.git
cd MentalGym-Pro
```

### 2️⃣ Backend
```bash
cd backend
npm install
```

### 3️⃣ Configuración Backend

Crear un archivo `.env` en la carpeta backend con las siguientes variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/mental-gym
JWT_SECRET=tu_secreto_jwt_aqui
```

Ejecutar en modo desarrollo:
```bash
npm run dev
```

Opcional: poblar base de datos con ejercicios:
```bash
npm run seed
# o para reiniciar la colección
npm run seed:wipe
```

### 4️⃣ Frontend
```bash
cd ../frontend
npm install
```

Crear archivo `.env.local` en la carpeta frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Ejecutar en modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

---

## 🔑 Variables de Entorno

### Backend (.env)

| Variable    | Descripción                    | Ejemplo |
|-------------|--------------------------------|---------|
| `PORT`      | Puerto donde corre el backend  | `5000`  |
| `MONGO_URI` | Conexión a MongoDB             | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET`| Secreto para generar tokens JWT| `mi_secreto_seguro_jwt` |

### Frontend (.env.local)

| Variable               | Descripción               | Ejemplo |
|------------------------|---------------------------|---------|
| `NEXT_PUBLIC_API_URL`  | URL de la API del backend | `http://localhost:5000/api` |

---

## ✨ Funcionalidades

- 👤 Autenticación segura - Registro, login con JWT, cookies seguras
- 🧩 Ejercicios mentales - Memoria, lógica y concentración
- 📊 Dashboard interactivo - Gráficas de progreso y estadísticas
- ⏳ Timers productivos - Técnicas Pomodoro y temporizadores
- 🎯 Sistema de logros - Gamificación con recompensas
- 🔔 Notificaciones - Alertas en tiempo real
- 📱 Diseño responsive - Adaptable a todos los dispositivos
- 🎨 Interfaz moderna - UI/UX cuidadosamente diseñada

---

## 🛠️ Scripts principales

### Backend
- `npm run dev` → iniciar en desarrollo con nodemon
- `npm start` → iniciar en producción
- `npm run seed` → poblar la base de datos con ejercicios
- `npm run seed:wipe` → resetear datos y poblar desde cero

### Frontend
- `npm run dev` → iniciar frontend con Next.js
- `npm run build` → construir para producción
- `npm run start` → iniciar en producción
- `npm run lint` → ejecutar linter

---

## 📡 API - Endpoints principales

### 🔑 Autenticación
- `POST /api/auth/register` → Registrar nuevo usuario
- `POST /api/auth/login` → Iniciar sesión
- `GET /api/auth/profile` → Obtener perfil del usuario autenticado
- `POST /api/auth/logout` → Cerrar sesión

### 🧩 Ejercicios
- `GET /api/exercises` → Listar todos los ejercicios
- `GET /api/exercises/:id` → Obtener detalle de un ejercicio
- `POST /api/exercises` → Crear ejercicio (admin)
- `GET /api/exercises/category/:category` → Filtrar por categoría

### 📊 Progreso
- `GET /api/progress` → Obtener progreso del usuario
- `POST /api/progress` → Guardar resultado de ejercicio
- `GET /api/progress/stats` → Obtener estadísticas de progreso
- `GET /api/progress/achievements` → Logros desbloqueados

### 👤 Usuario
- `PUT /api/users/profile` → Actualizar perfil de usuario
- `GET /api/users/leaderboard` → Tabla de clasificación

---

## 📌 Roadmap

### Próximas características
- 🔑 Autenticación con Google y OAuth
- 🧑‍🤝‍🧑 Sistema de amigos y retos compartidos
- 🧠 Más categorías de ejercicios mentales
- 🎨 Modo oscuro y personalización avanzada
- 📱 Aplicación móvil (React Native o Expo)
- 🌐 Internacionalización (múltiples idiomas)
- 💬 Chat en tiempo real entre usuarios
- 🏆 Torneos y competencias semanales

### Mejoras técnicas
- ✅ Tests unitarios y de integración
- 📊 Panel de administración avanzado
- 🔍 Motor de búsqueda inteligente
- 🚀 Optimización de rendimiento
- 📊 Analytics y métricas de uso

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!  

1. Haz un **fork** del proyecto  
2. Crea una rama con tu feature:  
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Haz **commit** de tus cambios:  
   ```bash
   git commit -m "feat: nueva funcionalidad"
   ```
4. Haz **push** a la rama:  
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Abre un **Pull Request** 🚀  

### Guía de contribución
- Sigue las convenciones de código existentes  
- Añade tests para nuevas funcionalidades  
- Actualiza la documentación correspondiente  
- Revisa que todo funcione correctamente  

---

## 📜 Licencia

Este proyecto está bajo la licencia **MIT**.  
Consulta el archivo [LICENSE](./LICENSE) para más detalles.
