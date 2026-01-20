# Frontend - Formulario de Waitlist

Formulario React simple para probar la conexión con el backend y la base de datos.

## 🛠️ Tecnologías

- **React** - Framework de UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **JavaScript** - Lenguaje de programación

## 🚀 Instalación y Uso

### 1. Instalar dependencias (si no están instaladas)

```bash
cd frontend
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5174** (o el puerto que Vite asigne)

### 3. Asegúrate de que el backend esté corriendo

El formulario se conecta a: **http://localhost:8000**

Para iniciar el backend:

```bash
cd ../backend
uvicorn main:app --reload
```

## 📝 Funcionalidades

- ✅ Formulario con validación de campos
- ✅ Conexión a API backend
- ✅ Mensajes de éxito/error
- ✅ Diseño responsive con Tailwind
- ✅ Estados de carga

## 🎨 Campos del Formulario

1. **Email** - Email de contacto (validación de formato)
2. **Nombre de la Empresa** - 2-255 caracteres
3. **Nicho de la Empresa** - Sector/industria
4. **Tamaño de la Empresa** - Selector con opciones predefinidas:
   - 1-10 empleados
   - 11-50 empleados
   - 51-200 empleados
   - 201-500 empleados
   - 500+ empleados

## 🔌 Endpoints del Backend

- `POST /waitlist` - Registrar nueva empresa
- `GET /health` - Verificar estado del servicio
- `GET /waitlist/count` - Obtener total de registros

## 🎯 Prueba de Conexión

1. Abre el formulario en el navegador
2. Completa todos los campos
3. Haz clic en "Registrarse"
4. Si la conexión es exitosa, verás un mensaje verde
5. Si hay error, verás un mensaje rojo con detalles

## 📁 Estructura de Archivos

```
frontend/
├── src/
│   ├── App.jsx              # Componente principal
│   ├── WaitlistForm.jsx     # Formulario de waitlist
│   ├── index.css            # Estilos con Tailwind
│   └── main.jsx             # Punto de entrada
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
└── package.json             # Dependencias
```

## 🐛 Solución de Problemas

### Error de conexión
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Revisa la configuración de CORS en el backend

### Email duplicado
- El backend rechaza emails ya registrados (error 409)

### Validación de campos
- Todos los campos son requeridos
- El email debe tener formato válido
- Los nombres deben tener al menos 2 caracteres
