import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { sendEmailCode } from '../api/authApi';

interface EmailVerificationStepProps {
  email: string;
  onCodeComplete: (code: string) => void;
  onBack: () => void;
  errorMessage?: string;
}

const EmailVerificationStep: React.FC<EmailVerificationStepProps> = ({ email, onCodeComplete, onBack, errorMessage }) => {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const codeInputRef = useRef<TextInput>(null);

  // Reset code input when an error arrives so user can re-enter
  useEffect(() => {
    if (errorMessage) {
      setCode('');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [errorMessage]);

  // Focus code input on mount (code is already sent from SignUpComponent)
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      codeInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(focusTimer);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      await sendEmailCode(email);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.error("Failed to resend code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 5);
    setCode(cleaned);
    if (cleaned.length === 5) {
      onCodeComplete(cleaned);
    }
  };

  const hasError = !!errorMessage;

  const codeItems = Array.from({ length: 5 }, (_, index) => code[index] ?? '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm your Email</Text>
      <Text style={styles.subtitle}>Enter the 5-digit code sent to {email}</Text>

      <TextInput
        ref={codeInputRef}
        value={code}
        onChangeText={handleCodeChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={5}
        style={styles.hiddenInput}
      />

      <View style={styles.codeRow}>
        {codeItems.map((item, index) => (
          <TouchableOpacity
            key={`code-${index}`}
            style={[styles.codeBox, hasError && styles.codeBoxError]}
            activeOpacity={0.9}
            onPress={() => codeInputRef.current?.focus()}
          >
            <Text style={styles.codeDigit}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasError && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <View style={styles.timerRow}>
        {canResend ? (
          <TouchableOpacity onPress={handleSendCode} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#00BCD4" />
            ) : (
              <Text style={styles.resendText}>Resend code</Text>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>Resend code in {timer}s</Text>
        )}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Wrong email? Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  codeBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22BED4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxError: {
    borderColor: '#E53935',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: -10,
  },
  codeDigit: {
    fontSize: 30,
    color: '#1D1D1D',
    fontWeight: '500',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    color: '#999',
    fontSize: 16,
  },
  resendText: {
    color: '#00BCD4',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00BCD4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default EmailVerificationStep;
