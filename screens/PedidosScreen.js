import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { pedidosService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isAdmin } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 PedidosScreen enfocada, cargando pedidos...');
      loadPedidos();
    }, [currentUser])
  );

  const loadPedidos = async () => {
    console.log('🔄 Iniciando carga de pedidos...');
    
    if (!currentUser) {
      console.warn('⚠️ No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      let data;
      if (isAdmin()) {
        console.log('👨‍💼 Usuario administrador - cargando todos los pedidos');
        data = await pedidosService.getAll();
      } else {
        console.log('👤 Cargando pedidos para usuario:', currentUser.uid);
        data = await pedidosService.getByUser(currentUser.uid);
      }
      console.log('📋 Datos recibidos en PedidosScreen:', data);
      setPedidos(data);
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const handleChangeStatus = async (pedidoId, currentStatus) => {
    console.log('🔄 [ADMIN] Iniciando cambio de estado del pedido');
    console.log('📋 Pedido ID:', pedidoId);
    console.log('📊 Estado actual:', currentStatus);
    
    const statusOptions = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const nextStatus = statusOptions[nextIndex];
    
    console.log('📈 Índice actual:', currentIndex);
    console.log('📈 Próximo índice:', nextIndex);
    console.log('🔄 Próximo estado:', nextStatus);
    console.log('📝 Opciones de estado disponibles:', statusOptions);

    // Usar confirm para web, Alert.alert para móvil
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      const confirmed = window.confirm(`¿Cambiar de "${currentStatus}" a "${nextStatus}"?`);
      console.log('🤔 [ADMIN] Respuesta del usuario (web):', confirmed);
      
      if (confirmed) {
        console.log('✅ [ADMIN] Usuario confirmó el cambio de estado');
        console.log('🔄 Iniciando actualización en Firebase...');
        
        try {
          await pedidosService.updateStatus(pedidoId, nextStatus);
          console.log('✅ [ADMIN] Estado actualizado en Firebase exitosamente');
          console.log('🔄 Recargando lista de pedidos...');
          
          await loadPedidos(); // Recargar pedidos
          console.log('✅ [ADMIN] Lista de pedidos recargada');
          
          window.alert(`Éxito: Estado cambiado a "${nextStatus}"`);
          console.log('🎉 [ADMIN] Cambio de estado completado exitosamente');
        } catch (error) {
          console.error('❌ [ADMIN] Error al actualizar estado del pedido:', error);
          console.error('🔍 Detalles del error:', error.message);
          console.error('🔍 Stack trace:', error.stack);
          window.alert('Error: No se pudo actualizar el estado: ' + error.message);
        }
      } else {
        console.log('❌ [ADMIN] Usuario canceló el cambio de estado');
      }
    } else {
      Alert.alert(
        'Cambiar Estado',
        `¿Cambiar de "${currentStatus}" a "${nextStatus}"?`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => {
              console.log('❌ [ADMIN] Usuario canceló el cambio de estado');
            }
          },
          {
            text: 'Confirmar',
            onPress: async () => {
              console.log('✅ [ADMIN] Usuario confirmó el cambio de estado');
              console.log('🔄 Iniciando actualización en Firebase...');
              
              try {
                await pedidosService.updateStatus(pedidoId, nextStatus);
                console.log('✅ [ADMIN] Estado actualizado en Firebase exitosamente');
                console.log('🔄 Recargando lista de pedidos...');
                
                await loadPedidos(); // Recargar pedidos
                console.log('✅ [ADMIN] Lista de pedidos recargada');
                
                Alert.alert('Éxito', `Estado cambiado a "${nextStatus}"`);
                console.log('🎉 [ADMIN] Cambio de estado completado exitosamente');
              } catch (error) {
                console.error('❌ [ADMIN] Error al actualizar estado del pedido:', error);
                console.error('🔍 Detalles del error:', error.message);
                console.error('🔍 Stack trace:', error.stack);
                Alert.alert('Error', 'No se pudo actualizar el estado: ' + error.message);
              }
            }
          }
        ]
      );
    }
  };

  const renderPedido = ({ item }) => (
    <View style={styles.pedidoCard}>
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoId}>Pedido #{item.id.substring(0, 8)}</Text>
        <Text style={styles.pedidoFecha}>{formatDate(item.fecha)}</Text>
      </View>
      
      {/* Mostrar información del usuario para administradores */}
      {isAdmin() && (
        <Text style={styles.pedidoUserId}>Usuario: {item.userId || 'N/A'}</Text>
      )}
      
      {/* Estado del pedido - clickeable para administradores */}
      {isAdmin() ? (
        <TouchableOpacity 
          onPress={() => {
            console.log('👆 [ADMIN] Botón de cambio de estado presionado');
            console.log('📋 [ADMIN] Datos del pedido:', {
              id: item.id,
              estado: item.estado,
              userId: item.userId,
              total: item.total
            });
            handleChangeStatus(item.id, item.estado);
          }}
          style={styles.estadoButton}
        >
          <Text style={styles.pedidoEstadoClickable}>
            Estado: {item.estado} (Tap para cambiar)
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.pedidoEstado}>Estado: {item.estado}</Text>
      )}
      
      <Text style={styles.pedidoTotal}>Total: ${item.total.toFixed(2)}</Text>
      
      <View style={styles.productosContainer}>
        <Text style={styles.productosTitle}>Productos:</Text>
        {item.productos.map((producto, index) => (
          <View key={index} style={styles.productoItem}>
            <Text style={styles.productoNombre}>{producto.nombre}</Text>
            <Text style={styles.productoCantidad}>
              {producto.cantidad}x ${producto.precio}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando pedidos...</Text>
      </View>
    );
  }

  if (pedidos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          {isAdmin() ? 'No hay pedidos en el sistema' : 'No tienes pedidos aún'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        renderItem={renderPedido}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1F',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A1F',
  },
  emptyText: {
    fontSize: 22,
    color: '#B0BEC5',
    textShadowColor: '#64B5F6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  listContainer: {
    padding: 20,
  },
  pedidoCard: {
    backgroundColor: '#1A1A3A',
    padding: 22,
    marginBottom: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2D2D5F',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00E5FF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pedidoFecha: {
    fontSize: 15,
    color: '#B0BEC5',
  },
  pedidoEstado: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'capitalize',
    color: '#FF6B9D',
    fontWeight: '700',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  pedidoTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00E5FF',
    marginBottom: 16,
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  productosContainer: {
    borderTopWidth: 2,
    borderTopColor: '#3D3D7A',
    paddingTop: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  productosTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(45, 45, 95, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D3D7A',
  },
  productoNombre: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  productoCantidad: {
    fontSize: 15,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  pedidoUserId: {
    fontSize: 14,
    color: '#B0BEC5',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  estadoButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
    marginBottom: 8,
  },
  pedidoEstadoClickable: {
    fontSize: 16,
    textTransform: 'capitalize',
    color: '#00E5FF',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});