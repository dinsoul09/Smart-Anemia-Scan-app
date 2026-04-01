import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnemiaScan } from '../api/ProfileApi';

interface ScanListProps {
  scans: AnemiaScan[];
}

const ScanList: React.FC<ScanListProps> = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>сканов не обнаружено</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scans.map((scan) => {
        const date = new Date(scan.scanDate);
        const formattedDate = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        return (
          <View key={scan.id} style={styles.resultCard}>
            <Text style={styles.resultTitle}>Anemia : {scan.isAnemic ? 'Yes' : 'No'}</Text>
            <Text style={styles.resultText}>Anemia probability: {(scan.confidence * 100).toFixed(1)}%</Text>
            <Text style={styles.resultDate}>{formattedDate}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#7CA0AC',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultCard: {
    borderWidth: 1,
    borderColor: '#86DDE8',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  resultTitle: {
    color: '#00BBD3',
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultText: {
    color: '#1A3C47',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 5,
  },
  resultDate: {
    color: '#7CA0AC',
    fontSize: 11,
    fontWeight: '400',
  },
});

export default ScanList;
