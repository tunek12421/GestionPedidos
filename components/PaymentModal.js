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
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2D2D5F',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 24,
    color: '#FFFFFF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  paymentDetails: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 15,
    width: '100%',
    borderWidth: 2,
    borderColor: '#3D3D7A',
  },
  detailLabel: {
    fontSize: 18,
    color: '#B0BEC5',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00E5FF',
    textShadowColor: '#00E5FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  simulationText: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
    color: '#FF6B9D',
    fontWeight: '700',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
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
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelButton: {
    backgroundColor: '#FF1744',
    borderColor: '#FF6B9D',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: '#00E5FF',
    borderColor: '#40C4FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: '#FF1744',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  confirmButtonText: {
    color: '#0A0A1F',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});