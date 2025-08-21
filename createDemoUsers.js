import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js';

const demoUsers = [
  {
    email: 'admin@test.com',
    password: 'admin123',
    nombre: 'Administrador Demo',
    rol: 'administrador'
  },
  {
    email: 'cliente@test.com', 
    password: 'cliente123',
    nombre: 'Cliente Demo',
    rol: 'cliente'
  }
];

async function createDemoUsers() {
  console.log('👤 Creando usuarios de demostración...');
  
  try {
    for (const userData of demoUsers) {
      const { email, password, nombre, rol } = userData;
      
      console.log(`📝 Creando usuario: ${email} (${rol})`);
      
      // Crear cuenta de autenticación
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Crear documento de usuario con rol
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: nombre,
        email: email,
        rol: rol,
        fechaCreacion: new Date()
      });
      
      console.log(`✅ Usuario ${email} creado exitosamente`);
    }
    
    console.log('🎉 Todos los usuarios de demostración han sido creados');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Los usuarios de demostración ya existen');
    } else {
      console.error('❌ Error creando usuarios:', error.message);
    }
  }
}

createDemoUsers();