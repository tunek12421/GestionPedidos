import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: 1 }]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        )
      };

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product) => {
    console.log('🛒 Intentando agregar producto:', product.nombre, 'Stock disponible:', product.stock);
    const existingItem = cart.items.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.cantidad : 0;
    
    if (currentQuantity >= product.stock) {
      console.log('❌ Stock insuficiente. Cantidad actual:', currentQuantity, 'Stock:', product.stock);
      return { success: false, message: `Solo quedan ${product.stock} unidades disponibles` };
    }
    
    dispatch({ type: 'ADD_ITEM', payload: product });
    console.log('✅ Producto agregado exitosamente');
    return { success: true, message: 'Producto agregado al carrito' };
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, cantidad, maxStock) => {
    console.log('🔄 Actualizando cantidad:', cantidad, 'Stock máximo:', maxStock);
    if (cantidad > maxStock) {
      console.log('❌ Cantidad excede stock disponible');
      return { success: false, message: `Solo hay ${maxStock} unidades disponibles` };
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, cantidad } });
    console.log('✅ Cantidad actualizada exitosamente');
    return { success: true };
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotal = () => {
    return cart.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};