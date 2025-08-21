import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function ConfirmDeleteModal({ visible, product, onConfirm, onCancel }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>🗑️ Eliminar Producto</Text>
          
          {product && (
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.nombre}</Text>
              <Text style={styles.productInfo}>
                Cantidad: {product.cantidad}
              </Text>
              <Text style={styles.productInfo}>
                Precio unitario: ${product.precio}
              </Text>
              <Text style={styles.totalAmount}>
                Total: ${(product.precio * product.cantidad).toFixed(2)}
              </Text>
            </View>
          )}

          <Text style={styles.confirmationText}>
            ¿Estás seguro de que deseas eliminar este producto del carrito?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>🗑️ Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 31, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A3A',
    borderRadius: 25,
    padding: 30,
    margin: 20,
    minWidth: 320,
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2D2D5F',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 24,
    color: '#FF1744',
    textAlign: 'center',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  productDetails: {
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    padding: 18,
    borderRadius: 15,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 6,
    borderLeftColor: '#FF1744',
    borderWidth: 2,
    borderColor: '#3D3D7A',
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  productInfo: {
    fontSize: 15,
    color: '#B0BEC5',
    marginBottom: 6,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF6B9D',
    marginTop: 12,
    textAlign: 'center',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  confirmationText: {
    fontSize: 17,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: '#546E7A',
    borderColor: '#78909C',
    shadowColor: '#546E7A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButton: {
    backgroundColor: '#FF1744',
    borderColor: '#FF6B9D',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: '#546E7A',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});