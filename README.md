# Gestión de Pedidos

Aplicación móvil para gestión de pedidos con roles de cliente y administrador.

**Demo en vivo:** https://gestion-pedidos-myhzuxgu4-tuneks-projects.vercel.app/

## Prueba Rápida

1. Abre el link del demo
2. Inicia sesión como cliente (`cliente@cliente.com` / `asdasd`)
3. Agrega productos al carrito y realiza un pedido
4. Cierra sesión e inicia como administrador (`asd@asd.com` / `asdasd`)
5. Ve todos los pedidos y cambia estados haciendo clic en "Estado: pendiente"

## Instalación

```bash
npm install
npx expo start
```

## Configuración Firebase

1. Crear proyecto en Firebase Console
2. Configurar Authentication (Email/Password)
3. Configurar Firestore Database
4. Actualizar credenciales en `firebaseConfig.js`

## Estructura de Base de Datos

### Colección: usuarios
```
{
  nombre: string,
  email: string,
  rol: "cliente" | "administrador",
  fechaCreacion: timestamp
}
```

### Colección: productos
```
{
  nombre: string,
  descripcion: string,
  precio: number,
  stock: number,
  imagen: string (opcional),
  fechaCreacion: timestamp
}
```

### Colección: pedidos
```
{
  userId: string,
  productos: array,
  total: number,
  estado: "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado",
  fecha: timestamp
}
```

## Usuarios de Prueba

### Acceso directo (demo en vivo)

**Administrador:**
- Email: `asd@asd.com`
- Contraseña: `asdasd`

**Cliente:**
- Email: `cliente@cliente.com`
- Contraseña: `asdasd`

### Crear usuarios locales

```bash
node createDemoUsers.js  # Crea usuarios demo
node seedData.js         # Crea productos de prueba
```

## Funcionalidades por Rol

### Cliente
- **Catálogo**: Ver productos con stock disponible en tiempo real
- **Carrito**: Agregar productos respetando límites de stock
- **Pedidos**: Realizar compras y rastrear estado de sus pedidos
- **Restricciones**: No puede ver pedidos de otros usuarios ni gestionar productos

### Administrador
- **Gestión de Productos**: Crear, editar, eliminar productos y controlar stock
- **Gestión de Pedidos**: 
  - Ver todos los pedidos del sistema con información del cliente
  - Cambiar estados: pendiente → procesando → enviado → entregado → cancelado
  - Hacer clic en "Estado: pendiente" para avanzar al siguiente estado
- **Gestión de Usuarios**: Crear nuevos clientes y administradores
- **Restricciones**: No tiene acceso al carrito ni puede realizar compras

## Sistema de Seguridad

### Autenticación
- Registro/login con email y contraseña
- Validación de permisos basada en roles
- Solo administradores pueden crear otros administradores

### Segregación de Datos
- Cada cliente ve únicamente sus propios pedidos
- Administradores acceden a todos los pedidos con filtros por usuario
- Stock actualizado automáticamente tras cada compra

### Control de Stock
- Validación en tiempo real de disponibilidad
- Reserva de productos en carrito
- Actualización automática tras confirmar pedido

## Deployment Android

### Opción 1: Expo Go
1. Instalar Expo Go desde Play Store
2. Escanear QR desde la terminal

### Opción 2: APK
```bash
npm install -g @expo/eos-cli
eas build --platform android
```

## Estructura del Proyecto

```
/components     # Componentes reutilizables
/context        # Context providers (Auth, Cart)
/screens        # Pantallas de la aplicación
/services       # Servicios Firebase
firebaseConfig.js  # Configuración Firebase
```

## Scripts Disponibles

- `npm start` - Iniciar desarrollo
- `node clearPedidos.js` - Limpiar tabla pedidos
- `node createDemoUsers.js` - Crear usuarios demo
- `node seedData.js` - Crear productos demo
