import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const { signup, currentUser, isAdmin } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { nombre, email, password, confirmPassword } = formData;
    
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

  const handleRegister = async () => {
    console.log('🚀 [REGISTER SCREEN] Iniciando proceso de registro...');
    console.log('📝 Datos del formulario:', {
      nombre: formData.nombre,
      email: formData.email,
      isAdmin: formData.isAdmin,
      passwordLength: formData.password?.length || 0
    });
    
    if (!validateForm()) {
      console.warn('⚠️ [REGISTER SCREEN] Validación de formulario falló');
      return;
    }

    console.log('⏳ [REGISTER SCREEN] Activando estado de carga...');
    setLoading(true);
    
    const { nombre, email, password, isAdmin } = formData;
    
    console.log('📤 [REGISTER SCREEN] Llamando función signup del contexto...');
    const result = await signup(email, password, nombre, isAdmin, currentUser?.uid);
    
    console.log('📊 [REGISTER SCREEN] Resultado del registro:', result);
    setLoading(false);

    if (result.success) {
      console.log('✅ [REGISTER SCREEN] Registro exitoso');
      Alert.alert(
        'Registro Exitoso', 
        `Cuenta ${isAdmin ? 'de administrador' : 'de cliente'} creada correctamente`,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      console.error('❌ [REGISTER SCREEN] Registro fallido:', result.error);
      Alert.alert('Error de Registro', getErrorMessage(result.error));
    }
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este email';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'La contraseña es muy débil';
      default:
        return 'Error al crear la cuenta. Intenta nuevamente';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>🛍️ Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a Gestión de Pedidos</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChangeText={(value) => handleInputChange('nombre', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Switch de administrador - solo visible para administradores autenticados */}
          {currentUser && isAdmin() && (
            <>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Cuenta de Administrador</Text>
                <Switch
                  value={formData.isAdmin}
                  onValueChange={(value) => handleInputChange('isAdmin', value)}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={formData.isAdmin ? '#ffffff' : '#9CA3AF'}
                />
              </View>

              {formData.isAdmin && (
                <View style={styles.adminWarning}>
                  <Text style={styles.adminWarningText}>
                    ⚠️ Las cuentas de administrador tienen acceso completo al sistema
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Información para usuarios no administradores */}
          {!currentUser && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Solo se pueden crear cuentas de cliente desde el registro público
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              ¿Ya tienes cuenta? Iniciar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  adminWarning: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  adminWarningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
  },
  loginButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#EBF8FF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  infoText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});