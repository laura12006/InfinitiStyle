# 🌟 StyleInfinite - Plataforma de Moda Sostenible

StyleInfinite es una aplicación web innovadora que promueve la moda sostenible a través del intercambio y venta de prendas entre usuarios. Construida con tecnologías modernas para ofrecer una experiencia de usuario excepcional.

## 🚀 Características Principales

- **💰 Venta y 🔄 Intercambio de Prendas**: Los usuarios pueden vender o intercambiar ropa de manera segura
- **📱 Chat en Tiempo Real**: Sistema de mensajería flotante con colores temáticos elegantes
- **⭐ Sistema de Valoraciones**: Los usuarios pueden calificar sus transacciones con sistema de 5 estrellas
- **💳 Gestión de Transacciones**: Seguimiento completo del proceso de compra-venta
- **📋 Lista de Deseos**: Guarda tus prendas favoritas para después
- **🔐 Autenticación Segura**: Sistema JWT con verificación por correo electrónico
- **👑 Panel de Administración**: Dashboard completo para gestión de usuarios y contenido
- **📊 Estadísticas**: Análisis detallado de usuarios, publicaciones y transacciones

## 🛠 Tecnologías Utilizadas

### Backend
- **Flask** - Framework web de Python
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Bcrypt** - Encriptación de contraseñas
- **SMTP** - Envío de correos de verificación
- **CORS** - Habilitación de peticiones cross-origin

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Build tool moderno y rápido
- **Tailwind CSS** - Framework de estilos utilitarios
- **React Router** - Enrutamiento del lado del cliente
- **Axios** - Cliente HTTP para API calls

## 📋 Requisitos Previos

- **MySQL 8.0+** instalado y funcionando
- **Node.js 18+** y **npm**
- **Python 3.9+** y **pip**

## ⚡ Instalación Rápida

### 1️⃣ Base de Datos
```bash
# En MySQL Workbench o consola de MySQL
mysql -u root -p
source scripts.sql
```

### 2️⃣ Backend (Flask)
```bash
cd backend
cp .env.example .env  # Configurar variables de entorno
pip install -r requirements.txt
python app.py
```

**Configuración del archivo `.env`:**
```env
DATABASE_HOST=trolley.proxy.rlwy.net
DATABASE_USER=root
DATABASE_PASSWORD=AYfCBLocvfPGUmPJfGABFQhBxRINwnMP
DATABASE_NAME=railway
DATABASE_PORT=56143

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=styleinfinite90@gmail.com
MAIL_PASSWORD=vzrqkruynuixxzlr

SECRET_KEY=

FLASK_ENV=development
```

### 3️⃣ Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Documentación API**: http://localhost:5000/docs (próximamente)

## 👤 Usuarios de Prueba

El sistema incluye usuarios predefinidos para testing:

### Administrador
- **Email**: styleInfinite90@gmail.com
- **Contraseña**: Admin123!

### Usuarios de Prueba
- **Email**: maria.garcia@email.com
- **Contraseña**: Usuario123!

*(Todos los usuarios de prueba usan la misma contraseña)*

## 📂 Estructura del Proyecto

```
StyleInfinite/
├── 📁 backend/          # API Flask
│   ├── app.py          # Aplicación principal
│   ├── config.py       # Configuración
│   ├── requirements.txt
│   └── uploads/        # Archivos subidos
├── 📁 frontend/         # App React
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/     # Páginas principales
│   │   └── api.js     # Cliente API
│   └── package.json
├── scripts.sql         # Schema de base de datos
└── README.md          # Este archivo
```

## 🔧 Comandos Útiles

### Backend
```bash
# Desarrollo
python app.py

# Con recarga automática
flask --app app run --debug

# Ver logs
tail -f app.log
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview
```

## 🐛 Solución de Problemas

### ❌ Error de conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Revisa las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `StyleInfinite` exista

### ❌ Error CORS en el frontend
- Confirma que el backend esté corriendo en el puerto 5000
- Verifica la configuración de CORS en `app.py`

### ❌ Problemas con uploads de imágenes
- Revisa permisos de la carpeta `backend/uploads/`
- Verifica que el directorio exista

## 📈 Funcionalidades Destacadas

### 💬 Chat Flotante
- Diseño elegante con colores vino temáticos
- Aparece solo cuando el usuario está autenticado
- Gestión de conversaciones en tiempo real
- Marcado automático de mensajes como leídos

### ⭐ Sistema de Valoraciones
- Calificación de 1 a 5 estrellas
- Solo disponible para transacciones completadas
- Prevención de valoraciones duplicadas
- Estadísticas de promedio por usuario

### 🔄 Gestión de Transacciones
- Estados: Pendiente → Pago Enviado → Confirmado → Enviado → Entregado
- Upload de comprobantes de pago
- Seguimiento completo del proceso
- Notificaciones por cada cambio de estado

## 👥 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

**Equipo StyleInfinite**
- 📧 Email: styleInfinite90@gmail.com
- 🌐 Website: [En desarrollo]

---

*Hecho con ❤️ para promover la moda sostenible*
