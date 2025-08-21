import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductosScreen from './screens/ProductosScreen';
import CarritoScreen from './screens/CarritoScreen';
import PedidosScreen from './screens/PedidosScreen';
import AdminScreen from './screens/AdminScreen';

// Components
import { TabBarIcon } from './components/TabBarIcon';
import HeaderCartButton from './components/HeaderCartButton';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Navegador de autenticación (Login/Register)
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Header con botón de logout
function HeaderLogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Salir</Text>
    </TouchableOpacity>
  );
}

// Navegador principal de la aplicación
function AppTabNavigator() {
  const { cart } = useCart();
  const { isAdmin } = useAuth();
  const itemCount = cart.items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopWidth: 1,
          borderTopColor: '#374151',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#1F2937',
          borderBottomWidth: 1,
          borderBottomColor: '#374151',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: '800',
        },
        headerRight: () => <HeaderLogoutButton />,
      }}
    >
      <Tab.Screen 
        name="Productos" 
        component={ProductosScreen}
        options={{
          title: '🛍️ Catálogo',
          headerTitle: 'Catálogo de Productos',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HeaderCartButton />
              <HeaderLogoutButton />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="storefront-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Pestaña de Carrito - solo visible para clientes */}
      {!isAdmin() && (
        <Tab.Screen 
          name="Carrito" 
          component={CarritoScreen}
          options={{
            title: '🛒 Carrito',
            headerTitle: 'Mi Carrito',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon 
                name="cart-outline" 
                size={size} 
                color={color} 
                badge={itemCount}
              />
            ),
          }}
        />
      )}
      
      <Tab.Screen 
        name="Pedidos" 
        component={PedidosScreen}
        options={{
          title: '📦 Pedidos',
          headerTitle: 'Mis Pedidos',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HeaderCartButton />
              <HeaderLogoutButton />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Pestaña de Admin - solo visible para administradores */}
      {isAdmin() && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen}
          options={{
            title: '⚙️ Admin',
            headerTitle: 'Administración',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Componente principal que maneja la navegación condicional
function AppContent() {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      {currentUser ? (
        <CartProvider>
          <AppTabNavigator />
        </CartProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

// App principal con proveedores
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});