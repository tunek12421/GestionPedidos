import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registrar usuario
  async function signup(email, password, nombre, isAdmin = false, requestingUserUid = null) {
    console.log('🔐 [AUTH] Iniciando registro de usuario...');
    console.log('📧 Email:', email);
    console.log('👤 Nombre:', nombre);
    console.log('🛡️ Es Admin:', isAdmin);
    console.log('👨‍💼 Usuario solicitante:', requestingUserUid);
    
    // Validar si se intenta crear un administrador
    if (isAdmin) {
      console.log('🔍 [AUTH] Validando permisos para crear administrador...');
      
      if (!requestingUserUid) {
        console.error('❌ [AUTH] Se requiere un usuario autenticado para crear administradores');
        return { 
          success: false, 
          error: 'Solo los administradores pueden crear cuentas de administrador' 
        };
      }
      
      try {
        console.log('🔍 [FIRESTORE] Verificando rol del usuario solicitante...');
        const requestingUserDoc = await getDoc(doc(db, 'usuarios', requestingUserUid));
        
        if (!requestingUserDoc.exists()) {
          console.error('❌ [AUTH] Usuario solicitante no encontrado');
          return { 
            success: false, 
            error: 'Usuario no válido para esta operación' 
          };
        }
        
        const requestingUserData = requestingUserDoc.data();
        console.log('👤 [AUTH] Datos del usuario solicitante:', requestingUserData);
        
        if (requestingUserData.rol !== 'administrador') {
          console.error('❌ [AUTH] Usuario sin permisos de administrador intentó crear admin');
          return { 
            success: false, 
            error: 'Solo los administradores pueden crear cuentas de administrador' 
          };
        }
        
        console.log('✅ [AUTH] Permisos de administrador verificados');
      } catch (error) {
        console.error('❌ [AUTH] Error verificando permisos:', error);
        return { 
          success: false, 
          error: 'Error al verificar permisos de administrador' 
        };
      }
    }
    
    try {
      console.log('🔥 [FIREBASE] Creando cuenta en Firebase Auth...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ [FIREBASE] Usuario creado exitosamente:', result.user.uid);
      
      const userData = {
        nombre: nombre,
        email: email,
        rol: isAdmin ? 'administrador' : 'cliente',
        fechaCreacion: new Date()
      };
      
      console.log('💾 [FIRESTORE] Guardando datos de usuario:', userData);
      
      // Crear documento de usuario con rol
      await setDoc(doc(db, 'usuarios', result.user.uid), userData);
      console.log('✅ [FIRESTORE] Datos de usuario guardados correctamente');
      
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Error en registro:', error);
      console.error('🔍 Código de error:', error.code);
      console.error('📝 Mensaje:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Iniciar sesión
  async function login(email, password) {
    console.log('🔐 [AUTH] Iniciando proceso de login...');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password?.length || 0);
    
    try {
      console.log('🔥 [FIREBASE] Enviando credenciales a Firebase Auth...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ [FIREBASE] Login exitoso:', result.user.uid);
      console.log('👤 Usuario autenticado:', result.user.email);
      
      return { success: true };
    } catch (error) {
      console.error('❌ [AUTH] Error en login:', error);
      console.error('🔍 Código de error:', error.code);
      console.error('📝 Mensaje:', error.message);
      console.error('🌐 Error completo:', JSON.stringify(error, null, 2));
      return { success: false, error: error.code || error.message };
    }
  }

  // Cerrar sesión
  async function logout() {
    try {
      await signOut(auth);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener rol del usuario
  async function fetchUserRole(uid) {
    console.log('👤 [ROLE] Obteniendo rol del usuario:', uid);
    
    try {
      console.log('💾 [FIRESTORE] Consultando documento de usuario...');
      const userDoc = await getDoc(doc(db, 'usuarios', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ [FIRESTORE] Datos del usuario encontrados:', userData);
        console.log('🛡️ Rol asignado:', userData.rol);
        
        setUserRole(userData.rol);
        return userData.rol;
      } else {
        console.warn('⚠️ [FIRESTORE] Documento de usuario no encontrado para UID:', uid);
      }
    } catch (error) {
      console.error('❌ [ROLE] Error obteniendo rol del usuario:', error);
      console.error('🔍 Error details:', error.message);
    }
    return null;
  }

  // Verificar si es administrador
  function isAdmin() {
    return userRole === 'administrador';
  }

  // Verificar si es cliente
  function isCliente() {
    return userRole === 'cliente';
  }

  useEffect(() => {
    console.log('🔄 [AUTH] Configurando listener de estado de autenticación...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 [AUTH] Cambio de estado detectado');
      
      if (user) {
        console.log('✅ [AUTH] Usuario autenticado:', user.uid, user.email);
        setCurrentUser(user);
        await fetchUserRole(user.uid);
      } else {
        console.log('❌ [AUTH] No hay usuario autenticado');
        setCurrentUser(null);
        setUserRole(null);
      }
      
      console.log('✅ [AUTH] Estado de carga completado');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    isAdmin,
    isCliente,
    fetchUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}