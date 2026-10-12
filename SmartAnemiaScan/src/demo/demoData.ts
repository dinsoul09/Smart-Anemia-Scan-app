// Демонстрационные записи: изображение + лабораторные данные из набора CP-AnemiC.
// Порядок — по возрастанию гемоглобина, чтобы на защите было видно поведение модели
// по всему диапазону, включая провал на тяжёлой анемии.

export type DemoItem = {
  id: string;
  image: number;          // require(...) — метро подставит статический ассет
  hb: number;             // лабораторное значение, г/дл
  severity: string;
  hospital: string;
  fold: number | null;
  group: 'clean' | 'duplicate_pair';
  vhash12: string;        // первые 12 символов хеша видимого содержимого
  note: string;
};

export const DEMO_ITEMS: DemoItem[] = [
  { id: 'Image_293', image: require('./images/Image_293.png'), hb: 3.1, severity: 'Severe',
    hospital: 'Bolgatanga Regional Hospital', fold: 2, group: 'clean', vhash12: '4ac3edf6736e',
    note: 'тяжёлая анемия — здесь модель промахивается сильнее всего' },
  { id: 'Image_264', image: require('./images/Image_264.png'), hb: 7.0, severity: 'Moderate',
    hospital: 'Nkawie-Toase Government Hospital', fold: 1, group: 'clean', vhash12: '79ca06c4efb1',
    note: '' },
  { id: 'Image_542', image: require('./images/Image_542.png'), hb: 10.0, severity: 'Mild',
    hospital: 'Ejusu Government Hospital', fold: 1, group: 'clean', vhash12: 'ac75167dee84',
    note: '' },
  { id: 'Image_707', image: require('./images/Image_707.png'), hb: 11.47, severity: 'Non-Anemic',
    hospital: 'Ahmadiyya Muslim Hospital', fold: 0, group: 'clean', vhash12: '2d6097a36815',
    note: '' },
  { id: 'Image_156', image: require('./images/Image_156.png'), hb: 12.6, severity: 'Non-Anemic',
    hospital: 'Bolgatanga Regional Hospital', fold: 3, group: 'clean', vhash12: 'b599ad09bc65',
    note: '' },
  { id: 'Image_700', image: require('./images/Image_700.png'), hb: 15.0, severity: 'Non-Anemic',
    hospital: 'Komfo Anokye Teaching Hospital', fold: 4, group: 'clean', vhash12: 'd6fa1c87e408',
    note: 'верх диапазона набора' },
];

// Пара записей с побитово одинаковым изображением и разными лабораторными значениями.
export const DUPLICATE_PAIR: DemoItem[] = [
  { id: 'Image_201', image: require('./images/Image_201.png'), hb: 10.4, severity: 'Mild',
    hospital: 'Kintampo Municipal Hospital', fold: null, group: 'duplicate_pair',
    vhash12: '01b0ad7991a9', note: 'исключена как дубликат' },
  { id: 'Image_289', image: require('./images/Image_289.png'), hb: 3.3, severity: 'Severe',
    hospital: 'Manhyia District Hospital', fold: null, group: 'duplicate_pair',
    vhash12: '01b0ad7991a9', note: 'исключена как дубликат' },
];
