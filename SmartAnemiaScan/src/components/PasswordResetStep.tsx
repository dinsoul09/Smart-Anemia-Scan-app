import React from 'react';
import { View, StyleSheet } from 'react-native';
import CommonPasswordField from './CommonPasswordField';

interface PasswordResetStepProps {
  newPassword: string;
  onNewPasswordChange: (text: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (text: string) => void;
}

const PasswordResetStep: React.FC<PasswordResetStepProps> = ({
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
}) => {
  return (
    <View style={styles.resetContainer}>
      <CommonPasswordField
        label="Password"
        value={newPassword}
        onChangeText={onNewPasswordChange}
      />
      <CommonPasswordField
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  resetContainer: {
    marginTop: 16,
    gap: 18,
  },
});

export default PasswordResetStep;
