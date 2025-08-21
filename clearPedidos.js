import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

async function clearPedidos() {
  console.log('🗑️ Limpiando todos los pedidos...');
  
  try {
    const querySnapshot = await getDocs(collection(db, 'pedidos'));
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No hay pedidos para eliminar');
      return;
    }
    
    const deletePromises = querySnapshot.docs.map(pedidoDoc => 
      deleteDoc(doc(db, 'pedidos', pedidoDoc.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ ${querySnapshot.docs.length} pedidos eliminados exitosamente`);
  } catch (error) {
    console.error('❌ Error al limpiar pedidos:', error);
  }
}

clearPedidos();