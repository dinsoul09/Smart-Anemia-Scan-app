import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, IconButton, TextField } from '../ui';
import { setLabHemoglobin } from '../../api/anemiaApi';
import { colors, fonts, type } from '../../theme';
import { formatCalendarDate, parseCalendarDate, toCalendarDate } from './scanFormat';

const HB_MIN = 3;
const HB_MAX = 25;
const MAX_DAYS_FROM_SCAN = 14;
const DAY_MS = 86400000;

const HB_RANGE_ERROR = `Enter haemoglobin in g/dL, between ${HB_MIN} and ${HB_MAX}. Labs often print g/L: 130 g/L = 13.0 g/dL.`;

const pad = (n) => String(n).padStart(2, '0');

// Calendar date -> the "DD / MM / YYYY" text the field shows
const toFieldText = (date) => `${pad(date.getDate())} / ${pad(date.getMonth() + 1)} / ${date.getFullYear()}`;

// Same mask as the date of birth in SignUpComponent
const maskDate = (text) => {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
};

const parseHb = (text) => {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(value) ? value : null;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Returns the parsed local date, or null when the text is not a real calendar date
const parseFieldDate = (text) => {
  const m = /^(\d{2}) \/ (\d{2}) \/ (\d{4})$/.exec(text);
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d ? date : null;
};

const validateHb = (text) => {
  const value = parseHb(text);
  if (value === null) return text.trim() === '' ? 'Enter your haemoglobin.' : HB_RANGE_ERROR;
  return value < HB_MIN || value > HB_MAX ? HB_RANGE_ERROR : '';
};

const validateDate = (text, scanDate) => {
  const date = parseFieldDate(text);
  if (!date) return 'Enter a valid date (DD / MM / YYYY).';
  if (date > startOfDay(new Date())) return 'The date can\'t be in the future.';
  if (scanDate) {
    const days = Math.abs(date - startOfDay(scanDate)) / DAY_MS;
    if (days > MAX_DAYS_FROM_SCAN) {
      return `The blood test should be within ${MAX_DAYS_FROM_SCAN} days of the scan (${formatCalendarDate(toCalendarDate(scanDate))}).`;
    }
  }
  return '';
};

// Collects a haemoglobin value from the user's own blood test and attaches it to a scan.
// `onSaved(result)` gets { scanId, labHemoglobin, labMeasuredAt }; `onNotFound` closes the flow on 404.
export default function LabHemoglobinScreen({ scan, onClose, onSaved, onNotFound }) {
  const editing = scan.labHemoglobin != null;
  const scanDateValue = scan.scanDate ?? scan.analyseDate;
  const scanDate = scanDateValue ? startOfDay(new Date(scanDateValue)) : null;

  const [hb, setHb] = useState(editing ? String(scan.labHemoglobin) : '');
  const [date, setDate] = useState(
    toFieldText(editing && scan.labMeasuredAt ? parseCalendarDate(scan.labMeasuredAt) : new Date()),
  );
  const [touched, setTouched] = useState({ hb: false, date: false });
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  const hbError = touched.hb ? validateHb(hb) : '';
  const dateError = touched.date ? validateDate(date, scanDate) : '';

  const handleSave = async () => {
    setTouched({ hb: true, date: true });
    if (validateHb(hb) || validateDate(date, scanDate)) return;

    setSaving(true);
    setServerError('');
    try {
      const result = await setLabHemoglobin(scan.id, parseHb(hb), toCalendarDate(parseFieldDate(date)));
      onSaved(result);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        onNotFound();
        return;
      }
      const description = status === 400 ? error.response.data?.description : null;
      setServerError(description || 'Could not save the result. Check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.ground} />
      <View style={styles.header}>
        <IconButton icon="x" accessibilityLabel="Close" onPress={onClose} />
        <Text style={styles.headerTitle} accessibilityRole="header">Blood test result</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.intro}>
            Had a blood test? Add your haemoglobin so we can check how well the scan works.
          </Text>

          <View style={styles.field}>
            <View style={styles.hbRow}>
              <TextField
                label="Haemoglobin"
                value={hb}
                onChangeText={(text) => {
                  setHb(text.replace(/[^0-9.,]/g, ''));
                  setServerError('');
                }}
                onBlur={() => setTouched((t) => ({ ...t, hb: true }))}
                placeholder="12.4"
                keyboardType="decimal-pad"
                editable={!saving}
                error={hbError}
                style={styles.flex}
              />
              <Text style={styles.unit}>g/dL</Text>
            </View>
            {!hbError ? <Text style={styles.hint}>Labs in Kazakhstan and the CIS often print g/L: 130 g/L = 13.0 g/dL.</Text> : null}
          </View>

          <TextField
            label="Date of the blood test"
            value={date}
            onChangeText={(text) => {
              setDate(maskDate(text));
              setServerError('');
            }}
            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
            placeholder="DD / MM / YYYY"
            keyboardType="number-pad"
            editable={!saving}
            error={dateError}
          />

          {serverError ? (
            <Text style={styles.serverError} accessibilityRole="alert">{serverError}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title={editing ? 'Update' : 'Save'}
            onPress={handleSave}
            loading={saving}
            disabled={hb.trim() === ''}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ground,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 20,
  },
  intro: {
    ...type.bodyMuted,
  },
  field: {
    gap: 8,
  },
  hbRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  unit: {
    ...type.bodyStrong,
    // aligns with the input box: label row (~16) + gap (8) + half of the 52 px box
    marginTop: 40,
  },
  hint: {
    ...type.caption,
  },
  serverError: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
