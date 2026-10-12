import { Image, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { API_BASE, REQUEST_TIMEOUT_MS } from './config';

export type DemoPrediction = {
  label?: string;        // ответ классификатора
  confidence?: number;   // максимум из score
  hb?: number;           // если модель возвращает число Hb
  raw: any;
  offline: boolean;      // true — показан сохранённый ответ, а не живой запрос
};

const CACHE_KEY = 'demoPredictionCache';

function readCache(): Record<string, any> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    }
  } catch (e) {}
  return {};
}

function writeCache(id: string, value: any) {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const all = readCache();
      all[id] = value;
      localStorage.setItem(CACHE_KEY, JSON.stringify(all));
    }
  } catch (e) {}
}

async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return localStorage.getItem('userToken');
    return await SecureStore.getItemAsync('userToken');
  } catch (e) {
    return null;
  }
}

// Приводим ответ бэкенда к одному виду: классификатор отдаёт predictedLabel + score,
// регрессия отдала бы число. Разбираем оба случая, не угадывая заранее.
function normalise(data: any, offline: boolean): DemoPrediction {
  const label = data?.predictedLabel ?? data?.PredictedLabel ?? undefined;
  const scores: number[] | undefined = data?.score ?? data?.Score ?? undefined;
  const confidence = Array.isArray(scores) && scores.length ? Math.max(...scores) : undefined;
  const hbRaw = data?.hb ?? data?.Hb ?? data?.hemoglobin ?? data?.predictedValue ?? undefined;
  const hb = typeof hbRaw === 'number' ? hbRaw : undefined;
  return { label, confidence, hb, raw: data, offline };
}

export async function predictDemoImage(id: string, imageModule: number): Promise<DemoPrediction> {
  const uri = Image.resolveAssetSource(imageModule).uri;
  const token = await getToken();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const form = new FormData();
    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob();
      form.append('ImageData', new File([blob], `${id}.png`, { type: 'image/png' }));
    } else {
      form.append('ImageData', { uri, name: `${id}.png`, type: 'image/png' } as any);
    }

    const res = await fetch(`${API_BASE}/Analysis/anemia/prediction`, {
      method: 'POST',
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    writeCache(id, data);            // запомнили ответ для офлайн-показа
    return normalise(data, false);
  } catch (e) {
    const cached = readCache()[id];
    if (cached) return normalise(cached, true);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
