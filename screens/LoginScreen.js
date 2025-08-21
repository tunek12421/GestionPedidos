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
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('🚀 [LOGIN SCREEN] Iniciando proceso de login...');
    console.log('📧 Email ingresado:', email);
    console.log('🔑 Contraseña ingresada:', password ? '[PROTEGIDA]' : '[VACÍA]');
    
    if (!email || !password) {
      console.warn('⚠️ [LOGIN SCREEN] Campos incompletos');
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    console.log('⏳ [LOGIN SCREEN] Activando estado de carga...');
    setLoading(true);
    
    console.log('🔐 [LOGIN SCREEN] Llamando función login del contexto...');
    const result = await login(email, password);
    
    console.log('📊 [LOGIN SCREEN] Resultado del login:', result);
    setLoading(false);

    if (result.success) {
      console.log('✅ [LOGIN SCREEN] Login exitoso - navegación automática');
      // La navegación se manejará automáticamente por el cambio de estado de autenticación
    } else {
      console.error('❌ [LOGIN SCREEN] Login fallido:', result.error);
      Alert.alert('Error de Autenticación', getErrorMessage(result.error));
    }
  };

  const getErrorMessage = (error) => {
    switch (error) {
      case 'auth/user-not-found':
        return 'No existe una cuenta con este email';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde';
      default:
        return 'Error al iniciar sesión. Intenta nuevamente';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>🛍️ Gestión de Pedidos</Text>
          <Text style={styles.subtitle}>Iniciar Sesión</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>

          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>🧪 Cuentas de prueba:</Text>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={() => {
                setEmail('admin@test.com');
                setPassword('admin123');
              }}
            >
              <Text style={styles.demoButtonText}>👤 Administrador</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={() => {
                setEmail('cliente@test.com');
                setPassword('cliente123');
              }}
            >
              <Text style={styles.demoButtonText}>🛒 Cliente</Text>
            </TouchableOpacity>
          </View>
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
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#546E7A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#3D3D7A',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#B0BEC5',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#FF1744',
  },
  registerButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '800',
  },
  demoContainer: {
    marginTop: 28,
    padding: 20,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#2D2D5F',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00E5FF',
    marginBottom: 16,
    textAlign: 'center',
  },
  demoButton: {
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B9D',
  },
  demoButtonText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '700',
  },
});