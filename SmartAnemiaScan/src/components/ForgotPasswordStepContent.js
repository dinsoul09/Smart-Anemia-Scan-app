import React from 'react';
import { View } from 'react-native';
import EmailInputStep from './EmailInputStep';
import CodeInputStep from './CodeInputStep';
import PasswordResetStep from './PasswordResetStep';

export default function ForgotPasswordStepContent({
  step,
  email,
  onEmailChange,
  emailError,
  code,
  onCodeChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  codeError,
}) {
  if (step === 'code') {
    return (
      <CodeInputStep
        code={code}
        onCodeChange={onCodeChange}
        codeError={codeError}
      />
    );
  }

  if (step === 'reset') {
    return (
      <PasswordResetStep
        newPassword={newPassword}
        onNewPasswordChange={onNewPasswordChange}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={onConfirmPasswordChange}
      />
    );
  }

  return (
    <EmailInputStep
      email={email}
      onEmailChange={onEmailChange}
      emailError={emailError}
    />
  );
}