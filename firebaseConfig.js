import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBZm3Z2gDbfYWapmbhVuZvY2Zwbvj-bP0g",
  authDomain: "gestion-pedidos-app-d8071.firebaseapp.com",
  projectId: "gestion-pedidos-app-d8071",
  storageBucket: "gestion-pedidos-app-d8071.firebasestorage.app",
  messagingSenderId: "581882277682",
  appId: "1:581882277682:web:3b0498e88aa0570714312b"
};

console.log('🔥 [FIREBASE CONFIG] Inicializando Firebase...');
console.log('🔧 Configuración:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPresent: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log('✅ [FIREBASE CONFIG] Firebase inicializado correctamente');
console.log('💾 Firestore configurado:', !!db);
console.log('🔐 Auth configurado:', !!auth);