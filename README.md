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

## Funcionalidades

### Cliente
- Ver catálogo de productos
- Agregar productos al carrito
- Realizar pedidos
- Ver historial de pedidos propios

### Administrador
- Gestionar productos (crear, editar, eliminar)
- Ver todos los pedidos del sistema
- Cambiar estados de pedidos
- Crear nuevos usuarios (clientes y administradores)

## Roles y Seguridad

- Clientes solo ven sus propios pedidos
- Administradores ven todos los pedidos
- Solo administradores pueden crear otros administradores
- Carrito no disponible para administradores

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
