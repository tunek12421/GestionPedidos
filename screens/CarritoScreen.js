import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { pedidosService, productosService } from '../services/firebase';
import PaymentModal from '../components/PaymentModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function CarritoScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();
  const { currentUser } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [productos, setProductos] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const producto = productos.find(p => p.id === itemId);
    if (!producto) return;

    const result = updateQuantity(itemId, newQuantity, producto.stock);
    if (!result.success) {
      Alert.alert('⚠️ Stock Limitado', result.message);
    }
  };

  const handleDeleteRequest = (item) => {
    console.log('🗑️ Solicitando eliminar producto:', item.nombre);
    setProductToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      console.log('✅ Confirmando eliminación de:', productToDelete.nombre);
      removeFromCart(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
      Alert.alert('🗑️ Eliminado', `${productToDelete.nombre} eliminado del carrito`);
    }
  };

  const handleCancelDelete = () => {
    console.log('❌ Cancelando eliminación');
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleRealizarPedido = () => {
    console.log('🛒 Iniciando proceso de pedido...');
    if (cart.items.length === 0) {
      console.log('❌ Carrito vacío');
      Alert.alert('Error', 'El carrito está vacío');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    console.log('💳 Confirmando pago...');
    
    if (!currentUser) {
      Alert.alert('Error', 'Debes estar autenticado para realizar un pedido');
      return;
    }

    setProcessingPayment(true);
    
    try {
      const pedido = {
        productos: cart.items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad
        })),
        total: getTotal(),
        userId: currentUser?.uid
      };

      console.log('📦 Datos del pedido preparados:', pedido);
      
      // Crear pedido en Firebase
      await pedidosService.create(pedido);
      
      // Reducir stock de productos
      await productosService.reduceStock(cart.items);
      
      console.log('🧹 Limpiando carrito...');
      clearCart();
      setShowPaymentModal(false);
      
      console.log('✅ Pago procesado exitosamente');
      Alert.alert('¡Pago Exitoso!', 'Tu pedido ha sido procesado correctamente');
      
      setTimeout(() => {
        console.log('🧭 Navegando a Pedidos...');
        navigation.navigate('Pedidos');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error al procesar pago:', error);
      Alert.alert('Error', 'No se pudo procesar el pago');
      setShowPaymentModal(false);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    console.log('❌ Pago cancelado');
    setShowPaymentModal(false);
  };

  const renderItem = ({ item }) => {
    const producto = productos.find(p => p.id === item.id);
    const maxStock = producto ? producto.stock : item.cantidad;
    const canIncrease = item.cantidad < maxStock;
    
    return (
      <View style={styles.cartItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.nombre}</Text>
          <Text style={styles.itemPrice}>${item.precio} c/u</Text>
          {producto && (
            <Text style={styles.stockInfo}>
              Stock disponible: {maxStock} | En carrito: {item.cantidad}
            </Text>
          )}
        </View>
        <View style={styles.itemActions}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, Math.max(1, item.cantidad - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.cantidad}</Text>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                !canIncrease && styles.disabledQuantityButton
              ]}
              onPress={() => handleQuantityChange(item.id, item.cantidad + 1)}
              disabled={!canIncrease}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleDeleteRequest(item)}
          >
            <Text style={styles.removeButtonText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>
          Total: ${(item.precio * item.cantidad).toFixed(2)}
        </Text>
      </View>
    );
  };

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>El carrito está vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: ${getTotal().toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleRealizarPedido}
        >
          <Text style={styles.orderButtonText}>Realizar Pedido</Text>
        </TouchableOpacity>
      </View>
      
      <PaymentModal
        visible={showPaymentModal}
        total={getTotal()}
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelPayment}
      />
      
      <ConfirmDeleteModal
        visible={showDeleteModal}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
  },
  listContainer: {
    padding: 20,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1F2937',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledQuantityButton: {
    backgroundColor: '#546E7A',
    borderColor: '#78909C',
    shadowColor: '#546E7A',
    opacity: 0.7,
  },
  quantityButtonText: {
    color: '#0A0A1F',
    fontSize: 20,
    fontWeight: '900',
  },
  quantity: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  orderButton: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});