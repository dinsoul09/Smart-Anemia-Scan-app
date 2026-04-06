import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnemiaScan } from '../api/ProfileApi';

interface ScanListProps {
  scans: AnemiaScan[];
}

const ScanList: React.FC<ScanListProps> = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="info" size={40} color="#B0CED9" />
        <Text style={styles.emptyText}>No scans found yet</Text>
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

        const probability = (scan.confidence * 100).toFixed(1);

        return (
          <View key={scan.id} style={styles.resultCard}>
            <View style={styles.cardHeader}>
              <View style={styles.statusRow}>
                <View style={[styles.statusIndicator, { backgroundColor: scan.isAnemic ? '#FF6B6B' : '#4CAF50' }]} />
                <Text style={styles.resultTitle}>
                  Anemia: {scan.isAnemic ? 'Detected' : 'Not detected'}
                </Text>
              </View>
              <Feather 
                name={scan.isAnemic ? 'alert-circle' : 'check-circle'} 
                size={22} 
                color={scan.isAnemic ? '#FF6B6B' : '#4CAF50'} 
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <Feather name="percent" size={14} color="#7CA0AC" />
                <Text style={styles.resultText}>Confidence: {probability}%</Text>
              </View>
              <View style={styles.footerItem}>
                <Feather name="calendar" size={14} color="#7CA0AC" />
                <Text style={styles.resultDate}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FEFF',
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F9FB',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#7CA0AC',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9F6FE',
    shadowColor: '#00BBD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  resultTitle: {
    color: '#1A3C47',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F9FB',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    color: '#1A3C47',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  resultDate: {
    color: '#7CA0AC',
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 6,
  },
});

export default ScanList;
