import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

const productos = [
  {
    nombre: "Laptop Gaming",
    descripcion: "Laptop para gaming de alta gama con RTX 4060",
    precio: 1299.99,
    stock: 5
  },
  {
    nombre: "iPhone 15 Pro",
    descripcion: "Smartphone Apple con cámara profesional",
    precio: 999.99,
    stock: 10
  },
  {
    nombre: "Auriculares Bluetooth",
    descripcion: "Auriculares inalámbricos con cancelación de ruido",
    precio: 199.99,
    stock: 25
  },
  {
    nombre: "Monitor 4K",
    descripcion: "Monitor 27 pulgadas 4K para diseño y gaming",
    precio: 399.99,
    stock: 8
  },
  {
    nombre: "Teclado Mecánico",
    descripcion: "Teclado mecánico RGB para gaming",
    precio: 129.99,
    stock: 15
  },
  {
    nombre: "Mouse Gamer",
    descripcion: "Mouse ergonómico con sensor óptico de alta precisión",
    precio: 79.99,
    stock: 20
  },
  {
    nombre: "Tablet Android",
    descripcion: "Tablet 10 pulgadas para trabajo y entretenimiento",
    precio: 299.99,
    stock: 12
  },
  {
    nombre: "Smartwatch",
    descripcion: "Reloj inteligente con monitor de salud",
    precio: 249.99,
    stock: 0
  }
];

async function seedDatabase() {
  console.log('Iniciando población de la base de datos...');
  
  try {
    for (const producto of productos) {
      const docRef = await addDoc(collection(db, 'productos'), producto);
      console.log(`Producto agregado con ID: ${docRef.id} - ${producto.nombre}`);
    }
    console.log('✅ Base de datos poblada exitosamente!');
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  }
}

seedDatabase();