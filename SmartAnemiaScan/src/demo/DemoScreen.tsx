import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native';
import { DEMO_ITEMS, DUPLICATE_PAIR, DemoItem } from './demoData';
import { predictDemoImage, DemoPrediction } from './demoApi';
import { CALIBRATION_OFFSET, DISCLAIMER, MODEL_NOTE } from './config';

const ru = (x: number, nd = 2) => x.toFixed(nd).replace('.', ',');


// Сравнивает два вложенных файла байт в байт прямо на экране — на защите это
// доказывает, что речь об одном изображении, а не о двух похожих.
function ByteCompare({ a, b }: { a: number; b: number }) {
  const [state, setState] = useState<{ busy?: boolean; text?: string; same?: boolean }>({});

  const compare = async () => {
    setState({ busy: true });
    try {
      const [ba, bb] = await Promise.all([a, b].map(async (m) => {
        const uri = Image.resolveAssetSource(m).uri;
        return new Uint8Array(await (await fetch(uri)).arrayBuffer());
      }));
      let same = ba.length === bb.length;
      if (same) {
        for (let i = 0; i < ba.length; i++) {
          if (ba[i] !== bb[i]) { same = false; break; }
        }
      }
      setState({
        same,
        text: same
          ? `Файлы совпадают байт в байт: ${ba.length} байт в каждом`
          : `Файлы различаются: ${ba.length} и ${bb.length} байт`,
      });
    } catch (e) {
      setState({ text: 'Не удалось прочитать файлы' });
    }
  };

  return (
    <View style={styles.compare}>
      <TouchableOpacity style={styles.button} onPress={compare}>
        <Text style={styles.buttonText}>Сравнить файлы байт в байт</Text>
      </TouchableOpacity>
      {state.busy && <ActivityIndicator style={{ marginTop: 8 }} />}
      {!!state.text && (
        <Text style={[styles.compareResult, state.same ? styles.compareOk : styles.error]}>
          {state.text}
        </Text>
      )}
    </View>
  );
}

type State = Record<string, { loading?: boolean; result?: DemoPrediction; error?: string }>;

export default function DemoScreen({ onGoBack }: { onGoBack?: () => void }) {
  const [state, setState] = useState<State>({});
  const [calibrated, setCalibrated] = useState(false);

  const run = async (item: DemoItem) => {
    setState((s) => ({ ...s, [item.id]: { loading: true } }));
    try {
      const result = await predictDemoImage(item.id, item.image);
      setState((s) => ({ ...s, [item.id]: { result } }));
    } catch (e: any) {
      setState((s) => ({ ...s, [item.id]: { error: 'Модель недоступна и сохранённого ответа нет' } }));
    }
  };

  const renderResult = (item: DemoItem) => {
    const st = state[item.id];
    if (!st) return null;
    if (st.loading) return <ActivityIndicator style={{ marginTop: 8 }} />;
    if (st.error) return <Text style={styles.error}>{st.error}</Text>;

    const r = st.result!;
    const hb = r.hb !== undefined ? (calibrated ? r.hb + CALIBRATION_OFFSET : r.hb) : undefined;

    return (
      <View style={styles.resultBox}>
        {hb !== undefined ? (
          <>
            <Text style={styles.resultMain}>Модель: {ru(hb, 1)} г/дл</Text>
            <Text style={styles.resultSub}>
              ошибка {ru(Math.abs(hb - item.hb), 2)} г/дл{calibrated ? ' · со сдвигом места съёмки' : ''}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.resultMain}>Модель: {r.label ?? '—'}</Text>
            {r.confidence !== undefined && (
              <Text style={styles.resultSub}>уверенность {ru(r.confidence * 100, 0)} %</Text>
            )}
          </>
        )}
        {r.offline && <Text style={styles.offline}>офлайн: ответ сохранён с прошлого запуска</Text>}
      </View>
    );
  };

  const card = (item: DemoItem) => (
    <View key={item.id} style={styles.card}>
      <Image source={item.image} style={styles.thumb} resizeMode="contain" />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.id}</Text>
        <Text style={styles.lab}>Лаборатория: {ru(item.hb, 1)} г/дл · {item.severity}</Text>
        <Text style={styles.meta}>{item.hospital}</Text>
        <Text style={styles.source}>источник метки: Anemia_Data_Collection_Sheet.xlsx</Text>
        {!!item.note && <Text style={styles.note}>{item.note}</Text>}
        <TouchableOpacity style={styles.button} onPress={() => run(item)}>
          <Text style={styles.buttonText}>Проверить моделью</Text>
        </TouchableOpacity>
        {renderResult(item)}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <Text style={styles.h1}>Демонстрация</Text>
        {!!onGoBack && (
          <TouchableOpacity onPress={onGoBack}><Text style={styles.back}>Назад</Text></TouchableOpacity>
        )}
      </View>
      <Text style={styles.modelNote}>{MODEL_NOTE}</Text>

      <TouchableOpacity style={styles.toggle} onPress={() => setCalibrated((v) => !v)}>
        <Text style={styles.toggleText}>
          Калибровка места съёмки: {calibrated ? 'включена (+' + ru(CALIBRATION_OFFSET, 2) + ' г/дл)' : 'выключена'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Сдвиг оценивается по десяти пробам с известным лабораторным результатом. Переключатель
        действует, только если модель возвращает число гемоглобина.
      </Text>

      <Text style={styles.h2}>Записи с известным анализом крови</Text>
      {DEMO_ITEMS.map(card)}

      <Text style={styles.h2}>Одно изображение — две разные метки</Text>
      <Text style={styles.note}>
        У обеих записей совпадает хеш видимого содержимого: {DUPLICATE_PAIR[0].vhash12}. Это одна и
        та же картинка, опубликованная дважды с разными лабораторными значениями. Обе исключены из
        обучающего набора.
      </Text>
      <ByteCompare a={DUPLICATE_PAIR[0].image} b={DUPLICATE_PAIR[1].image} />
      {DUPLICATE_PAIR.map(card)}

      <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FCFCFB' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h1: { fontSize: 24, fontWeight: '700', color: '#0B0B0B' },
  back: { fontSize: 16, color: '#2A78D6' },
  h2: { fontSize: 17, fontWeight: '700', color: '#0B0B0B', marginTop: 24, marginBottom: 8 },
  modelNote: { fontSize: 13, color: '#52514E', marginTop: 4 },
  toggle: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
            backgroundColor: '#EDF3FC', alignSelf: 'flex-start' },
  toggleText: { fontSize: 14, color: '#1C5CAB', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12,
          marginBottom: 12, borderWidth: 1, borderColor: '#E1E0D9' },
  thumb: { width: 104, height: 78, borderRadius: 8, backgroundColor: '#F5F5F3' },
  cardBody: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0B0B0B' },
  lab: { fontSize: 14, color: '#0B0B0B', marginTop: 2 },
  meta: { fontSize: 12, color: '#898781', marginTop: 2 },
  note: { fontSize: 12, color: '#52514E', marginTop: 6, lineHeight: 17 },
  button: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14,
            borderRadius: 10, backgroundColor: '#2A78D6' },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  resultBox: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E1E0D9' },
  resultMain: { fontSize: 16, fontWeight: '700', color: '#0B0B0B' },
  resultSub: { fontSize: 13, color: '#52514E', marginTop: 2 },
  offline: { fontSize: 12, color: '#EB6834', marginTop: 4 },
  error: { fontSize: 13, color: '#D03B3B', marginTop: 8 },
  source: { fontSize: 11, color: '#898781', marginTop: 2 },
  compare: { marginTop: 10, marginBottom: 12 },
  compareResult: { marginTop: 10, fontSize: 15, fontWeight: '600' },
  compareOk: { color: '#0CA30C' },
  disclaimer: { fontSize: 13, color: '#52514E', marginTop: 28, fontStyle: 'italic' },
});
