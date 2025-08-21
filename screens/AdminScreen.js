import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Switch
} from 'react-native';
import { productosService } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function AdminScreen() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: ''
  });
  const [userFormData, setUserFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  });
  const { isAdmin, signup, currentUser } = useAuth();

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

  const openModal = (producto = null) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        imagen: producto.imagen || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        imagen: ''
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      imagen: ''
    });
  };

  const handleSave = async () => {
    const { nombre, descripcion, precio, stock, imagen } = formData;

    if (!nombre || !descripcion || !precio || !stock) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock);

    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor a 0');
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'El stock debe ser un número válido mayor o igual a 0');
      return;
    }

    const productoData = {
      nombre,
      descripcion,
      precio: precioNum,
      stock: stockNum,
      imagen: imagen || null,
      fechaActualizacion: new Date()
    };

    try {
      if (editingProduct) {
        await productosService.update(editingProduct.id, productoData);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        productoData.fechaCreacion = new Date();
        await productosService.create(productoData);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }
      
      closeModal();
      await loadProductos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const handleDelete = (producto) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await productosService.delete(producto.id);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
              await loadProductos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const renderProducto = ({ item }) => (
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
        <Text style={styles.productStock}>Stock: {item.stock}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openModal(item)}
          >
            <Text style={styles.buttonText}>✏️ Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.buttonText}>🗑️ Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const openUserModal = () => {
    setUserFormData({
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      isAdmin: false
    });
    setUserModalVisible(true);
  };

  const closeUserModal = () => {
    setUserModalVisible(false);
    setUserFormData({
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      isAdmin: false
    });
  };

  const validateUserForm = () => {
    const { nombre, email, password, confirmPassword } = userFormData;
    
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) {
      return;
    }

    const { nombre, email, password, isAdmin: isAdminUser } = userFormData;
    
    try {
      const result = await signup(email, password, nombre, isAdminUser, currentUser?.uid);
      
      if (result.success) {
        Alert.alert(
          'Usuario Creado', 
          `Cuenta ${isAdminUser ? 'de administrador' : 'de cliente'} creada correctamente`
        );
        closeUserModal();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el usuario');
    }
  };

  if (!isAdmin()) {
    return (
      <View style={styles.accessDenied}>
        <Text style={styles.accessDeniedText}>
          🚫 Acceso Denegado
        </Text>
        <Text style={styles.accessDeniedSubtext}>
          Solo los administradores pueden acceder a esta sección
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openModal()}
          >
            <Text style={styles.addButtonText}>➕ Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.userButton}
            onPress={openUserModal}
          >
            <Text style={styles.addButtonText}>👤 Usuario</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal para crear/editar producto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(value) => setFormData({...formData, nombre: value})}
                  placeholder="Nombre del producto"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descripción *</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.descripcion}
                  onChangeText={(value) => setFormData({...formData, descripcion: value})}
                  placeholder="Descripción del producto"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.precio}
                  onChangeText={(value) => setFormData({...formData, precio: value})}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(value) => setFormData({...formData, stock: value})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>URL de Imagen</Text>
                <TextInput
                  style={styles.input}
                  value={formData.imagen}
                  onChangeText={(value) => setFormData({...formData, imagen: value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para crear usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={userModalVisible}
        onRequestClose={closeUserModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Crear Nuevo Usuario</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre Completo *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.nombre}
                  onChangeText={(value) => setUserFormData({...userFormData, nombre: value})}
                  placeholder="Juan Pérez"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.email}
                  onChangeText={(value) => setUserFormData({...userFormData, email: value})}
                  placeholder="usuario@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.password}
                  onChangeText={(value) => setUserFormData({...userFormData, password: value})}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar Contraseña *</Text>
                <TextInput
                  style={styles.input}
                  value={userFormData.confirmPassword}
                  onChangeText={(value) => setUserFormData({...userFormData, confirmPassword: value})}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Cuenta de Administrador</Text>
                <Switch
                  value={userFormData.isAdmin}
                  onValueChange={(value) => setUserFormData({...userFormData, isAdmin: value})}
                  trackColor={{ false: '#3D3D7A', true: '#00E5FF' }}
                  thumbColor={userFormData.isAdmin ? '#ffffff' : '#B0BEC5'}
                />
              </View>

              {userFormData.isAdmin && (
                <View style={styles.adminWarning}>
                  <Text style={styles.adminWarningText}>
                    ⚠️ Las cuentas de administrador tienen acceso completo al sistema
                  </Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeUserModal}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateUser}
                >
                  <Text style={styles.buttonText}>Crear Usuario</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0A1F',
  },
  accessDeniedText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF1744',
    marginBottom: 16,
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  accessDeniedSubtext: {
    fontSize: 18,
    color: '#B0BEC5',
    textAlign: 'center',
    textShadowColor: '#64B5F6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1A1A3A',
    borderBottomWidth: 3,
    borderBottomColor: '#2D2D5F',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  addButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#40C4FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  userButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF8A80',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  addButtonText: {
    color: '#0A0A1F',
    fontWeight: '900',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  listContainer: {
    padding: 20,
  },
  productCard: {
    backgroundColor: '#1A1A3A',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2D2D5F',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#2A2A4A',
    borderBottomWidth: 2,
    borderBottomColor: '#3D3D7A',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  productDescription: {
    fontSize: 15,
    color: '#B0BEC5',
    marginBottom: 12,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00E5FF',
    marginBottom: 8,
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  productStock: {
    fontSize: 16,
    color: '#FF6B9D',
    marginBottom: 16,
    fontWeight: '700',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#00E5FF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40C4FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF1744',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#0A0A1F',
    fontWeight: '900',
    fontSize: 14,
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 31, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A3A',
    margin: 20,
    borderRadius: 20,
    padding: 28,
    maxHeight: '90%',
    width: '90%',
    borderWidth: 3,
    borderColor: '#2D2D5F',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 24,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#00E5FF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#3D3D7A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#2A2A4A',
    color: '#FFFFFF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  textArea: {
    borderWidth: 2,
    borderColor: '#3D3D7A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#2A2A4A',
    color: '#FFFFFF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF1744',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00E5FF',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#40C4FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2A2A4A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3D3D7A',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00E5FF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  adminWarning: {
    backgroundColor: '#2A1810',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  adminWarningText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});