import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { productosService } from '../services/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductosScreen() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (producto) => {
    const result = addToCart(producto);
    if (result.success) {
      Alert.alert('✅ Éxito', result.message);
    } else {
      Alert.alert('⚠️ Stock Limitado', result.message);
    }
  };

  const getAvailableStock = (producto) => {
    const itemInCart = cart.items.find(item => item.id === producto.id);
    const quantityInCart = itemInCart ? itemInCart.cantidad : 0;
    return producto.stock - quantityInCart;
  };

  const renderProducto = ({ item }) => {
    const availableStock = getAvailableStock(item);
    const isOutOfStock = availableStock <= 0;
    const isLowStock = availableStock <= 3 && availableStock > 0;
    const itemInCart = cart.items.find(cartItem => cartItem.id === item.id);
    
    return (
      <View style={styles.productCard}>
        {item.imagen && (
          <Image 
            source={{ uri: item.imagen }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <Text style={styles.productDescription}>{item.descripcion}</Text>
          <Text style={styles.productPrice}>${item.precio}</Text>
        
        <View style={styles.stockContainer}>
          <Text style={[
            styles.productStock,
            isOutOfStock && styles.outOfStock,
            isLowStock && styles.lowStock
          ]}>
            Stock disponible: {isAdmin() ? item.stock : availableStock}
          </Text>
          {!isAdmin() && itemInCart && (
            <Text style={styles.inCartText}>
              En carrito: {itemInCart.cantidad}
            </Text>
          )}
          {isAdmin() && (
            <Text style={styles.adminText}>
              👨‍💼 Vista de administrador
            </Text>
          )}
        </View>

        {!isAdmin() && (
          <TouchableOpacity
            style={[
              styles.addButton, 
              isOutOfStock && styles.disabledButton,
              isLowStock && styles.lowStockButton
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={isOutOfStock}
          >
            <Text style={styles.buttonText}>
              {isOutOfStock ? '❌ Sin Stock' : 
               isLowStock ? `⚠️ Últimas ${availableStock}` : 
               '➕ Agregar'}
            </Text>
          </TouchableOpacity>
        )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  productDescription: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  stockContainer: {
    marginBottom: 6,
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  productStock: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '500',
  },
  outOfStock: {
    color: '#EF4444',
    fontWeight: '600',
  },
  lowStock: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  inCartText: {
    fontSize: 8,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 2,
  },
  lowStockButton: {
    backgroundColor: '#F59E0B',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  adminText: {
    fontSize: 8,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
    fontStyle: 'italic',
  },
});