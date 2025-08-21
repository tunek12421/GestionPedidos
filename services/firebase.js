import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const productosService = {
  async getAll() {
    console.log('🔍 Cargando productos...');
    const querySnapshot = await getDocs(collection(db, 'productos'));
    const productos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('✅ Productos cargados:', productos.length);
    return productos;
  },

  async updateStock(productoId, newStock) {
    console.log(`📦 Actualizando stock del producto ${productoId} a ${newStock}`);
    const productoRef = doc(db, 'productos', productoId);
    await updateDoc(productoRef, { stock: newStock });
    console.log('✅ Stock actualizado exitosamente');
  },

  async reduceStock(productos) {
    console.log('📉 Reduciendo stock de productos:', productos);
    const updatePromises = productos.map(async (item) => {
      const productoRef = doc(db, 'productos', item.id);
      const productoSnap = await getDoc(productoRef);
      
      if (productoSnap.exists()) {
        const currentStock = productoSnap.data().stock;
        const newStock = Math.max(0, currentStock - item.cantidad);
        await updateDoc(productoRef, { stock: newStock });
        console.log(`✅ Producto ${item.nombre}: stock ${currentStock} → ${newStock}`);
      }
    });
    
    await Promise.all(updatePromises);
    console.log('✅ Stock reducido para todos los productos');
  },

  async create(productoData) {
    console.log('➕ Creando nuevo producto:', productoData);
    const docRef = await addDoc(collection(db, 'productos'), productoData);
    console.log('✅ Producto creado con ID:', docRef.id);
    return docRef.id;
  },

  async update(productoId, productoData) {
    console.log(`📝 Actualizando producto ${productoId}:`, productoData);
    const productoRef = doc(db, 'productos', productoId);
    await updateDoc(productoRef, productoData);
    console.log('✅ Producto actualizado exitosamente');
  },

  async delete(productoId) {
    console.log(`🗑️ Eliminando producto ${productoId}`);
    const productoRef = doc(db, 'productos', productoId);
    await deleteDoc(productoRef);
    console.log('✅ Producto eliminado exitosamente');
  },

  async getById(productoId) {
    console.log(`🔍 Buscando producto ${productoId}`);
    const productoRef = doc(db, 'productos', productoId);
    const productoSnap = await getDoc(productoRef);
    
    if (productoSnap.exists()) {
      const producto = { id: productoSnap.id, ...productoSnap.data() };
      console.log('✅ Producto encontrado:', producto);
      return producto;
    } else {
      console.log('❌ Producto no encontrado');
      return null;
    }
  }
};

export const pedidosService = {
  async create(pedido) {
    console.log('📝 Creando pedido:', pedido);
    const docRef = await addDoc(collection(db, 'pedidos'), {
      ...pedido,
      fecha: new Date(),
      estado: 'pendiente'
    });
    console.log('✅ Pedido creado con ID:', docRef.id);
    return docRef.id;
  },

  async getByUser(userId) {
    console.log('🔍 Buscando pedidos para usuario:', userId);
    const q = query(
      collection(db, 'pedidos'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const pedidos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
        const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
        return fechaB.getTime() - fechaA.getTime(); // Ordenar descendente (más reciente primero)
      });
    console.log('✅ Pedidos encontrados:', pedidos.length, pedidos);
    return pedidos;
  },

  async getAll() {
    console.log('🔍 Obteniendo todos los pedidos (admin)...');
    const querySnapshot = await getDocs(collection(db, 'pedidos'));
    const pedidos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
        const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
        return fechaB.getTime() - fechaA.getTime(); // Ordenar descendente (más reciente primero)
      });
    console.log('✅ Todos los pedidos encontrados:', pedidos.length);
    return pedidos;
  },

  async updateStatus(pedidoId, nuevoEstado) {
    console.log(`📝 [FIREBASE] Actualizando estado del pedido ${pedidoId} a ${nuevoEstado}`);
    console.log('🔍 [FIREBASE] Validando parámetros...');
    console.log('  - Pedido ID:', pedidoId, 'tipo:', typeof pedidoId);
    console.log('  - Nuevo estado:', nuevoEstado, 'tipo:', typeof nuevoEstado);
    
    if (!pedidoId) {
      throw new Error('ID de pedido es requerido');
    }
    
    if (!nuevoEstado) {
      throw new Error('Nuevo estado es requerido');
    }
    
    try {
      console.log('🔄 [FIREBASE] Creando referencia al documento...');
      const pedidoRef = doc(db, 'pedidos', pedidoId);
      console.log('📄 [FIREBASE] Referencia creada:', pedidoRef.path);
      
      const updateData = { 
        estado: nuevoEstado,
        fechaActualizacion: new Date()
      };
      console.log('📋 [FIREBASE] Datos a actualizar:', updateData);
      
      console.log('⏳ [FIREBASE] Ejecutando updateDoc...');
      await updateDoc(pedidoRef, updateData);
      console.log('✅ [FIREBASE] updateDoc ejecutado exitosamente');
      console.log('🎉 [FIREBASE] Estado del pedido actualizado correctamente');
    } catch (error) {
      console.error('❌ [FIREBASE] Error en updateStatus:', error);
      console.error('🔍 [FIREBASE] Error code:', error.code);
      console.error('🔍 [FIREBASE] Error message:', error.message);
      console.error('🔍 [FIREBASE] Full error:', error);
      throw error;
    }
  }
};