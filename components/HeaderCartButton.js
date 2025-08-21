import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { TabBarIcon } from './TabBarIcon';

export default function HeaderCartButton() {
  const navigation = useNavigation();
  const { cart } = useCart();
  const { isAdmin } = useAuth();
  const itemCount = cart.items.reduce((total, item) => total + item.cantidad, 0);

  // No mostrar el botón para administradores
  if (isAdmin()) {
    return null;
  }

  const handlePress = () => {
    navigation.navigate('Carrito');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <TabBarIcon 
        name="cart" 
        size={24} 
        color="#FFFFFF" 
        badge={itemCount}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});