import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function PaymentModal({ visible, total, onConfirm, onCancel }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirmar Pago</Text>
          
          <View style={styles.paymentDetails}>
            <Text style={styles.detailLabel}>Total a pagar:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>

          <Text style={styles.simulationText}>
            🎭 Simulación de Pago
          </Text>
          <Text style={styles.infoText}>
            Este es un pago simulado para fines demostrativos
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>💳 Confirmar Pago</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    minWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  paymentDetails: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    width: '100%',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
  },
  simulationText: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});