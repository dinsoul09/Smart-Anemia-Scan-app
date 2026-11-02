import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import FieldMessage from './FieldMessage';
import { colors, fonts, radii } from '../../theme';

const TextField = forwardRef(function TextField(
  {
    label,
    error,
    secure = false,
    rightIcon,
    onRightPress,
    rightLabel,
    labelAccessory,
    clearable = false,
    style,
    inputStyle,
    onFocus,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const showToggle = secure;
  const trailingIcon = showToggle ? (hidden ? 'eye' : 'eye-off') : rightIcon;
  const onTrailingPress = showToggle ? () => setHidden((h) => !h) : onRightPress;
  const trailingLabel = showToggle ? (hidden ? 'Show password' : 'Hide password') : rightLabel;

  return (
    <View style={[styles.block, style]}>
      {label || labelAccessory ? (
        <View style={styles.labelRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {labelAccessory}
        </View>
      ) : null}
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          error && styles.boxError,
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor="#7A8783"
          secureTextEntry={secure && hidden}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, inputStyle]}
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
        />
        {clearable && inputProps.value ? (
          <Pressable
            onPress={() => inputProps.onChangeText?.('')}
            accessibilityRole="button"
            accessibilityLabel="Clear"
            hitSlop={6}
            style={styles.trailing}
          >
            <View style={styles.clear}>
              <Feather name="x" size={11} color={colors.surface} />
            </View>
          </Pressable>
        ) : null}
        {trailingIcon ? (
          <Pressable
            onPress={onTrailingPress}
            accessibilityRole="button"
            accessibilityLabel={trailingLabel}
            hitSlop={6}
            style={styles.trailing}
          >
            <Feather name={trailingIcon} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {/* `error` can be just `true` (red border only) or the line to show under the field */}
      {typeof error === 'string' && error ? <FieldMessage>{error}</FieldMessage> : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.ink,
  },
  box: {
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  boxFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  boxError: {
    borderColor: '#C9503E',
    borderWidth: 1.5,
    backgroundColor: '#FDF6F3',
  },
  clear: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#B8C2BF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
    paddingRight: 16,
    outlineStyle: 'none',
  },
  trailing: {
    width: 44,
    height: 44,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
