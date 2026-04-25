import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const SuccessModal = ({ visible, message, onClose }) => {
  return (
    <Modal
      animationType="fade" 
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>

          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>{message}</Text>
          
          {/* Action button (e.g., "Continue") */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    minWidth: 150,
    alignItems: 'center',
    // Light button shadow
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SuccessModal;