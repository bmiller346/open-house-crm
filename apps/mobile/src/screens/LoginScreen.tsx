import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // TODO: Implement actual login logic
    setTimeout(() => {
      setLoading(false);
      // Navigate to main app
    }, 2000);
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
  };

  const handleSignUp = () => {
    // TODO: Navigate to sign up screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>Open House CRM</Text>
          <Text style={styles.subtitle}>Real Estate Wholesale Platform</Text>
        </View>

        {/* Login Form */}
        <Card style={styles.loginCard}>
          <Card.Content>
            <Text style={styles.loginTitle}>Welcome Back</Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password || loading}
              style={styles.loginButton}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Button
              mode="text"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              Forgot Password?
            </Button>
          </Card.Content>
        </Card>

        {/* Sign Up */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <Button
            mode="outlined"
            onPress={handleSignUp}
            style={styles.signUpButton}
          >
            Create Account
          </Button>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>📊 Lead Management & Analytics</Text>
            <Text style={styles.featureItem}>🏠 Property Inventory Tracking</Text>
            <Text style={styles.featureItem}>📅 Appointment Scheduling</Text>
            <Text style={styles.featureItem}>💰 Deal & Transaction Management</Text>
            <Text style={styles.featureItem}>📧 Marketing Campaign Tools</Text>
            <Text style={styles.featureItem}>🤖 AI-Powered Insights</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loginCard: {
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  signUpContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  signUpButton: {
    width: '100%',
  },
  featuresContainer: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default LoginScreen;
