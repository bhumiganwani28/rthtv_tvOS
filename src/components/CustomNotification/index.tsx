import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { COLORS } from '../../theme/colors'; // Your app's color theme

interface CustomNotificationProps {
  title?: string; // Notification title
  message: string; // Notification message
  imageUrl: string; // Notification image URL
  onClose?: () => void; // Optional callback for when the notification is closed
}

const CustomNotification: React.FC<CustomNotificationProps> = ({ message, imageUrl, onClose }) => {
  const [visible, setVisible] = useState(false);
  const slideAnim = new Animated.Value(-100); // Animation to slide the notification from top

  // Show the notification with animation
  const showNotification = () => {
    setVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide the notification with animation
  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onClose) onClose(); // Trigger onClose callback if provided
    });
  };

  useEffect(() => {
    if (message) {
      showNotification();
      const timer = setTimeout(hideNotification, 3000); // Automatically hide after 3 seconds
      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [message]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.notificationContainer, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.notificationContent} onPress={()=>console.log(">>>")}>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>New Notification</Text>
          <Text style={styles.notificationMessage}>{message}</Text>
        </View>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.notificationImage} />
        ) : null}
        
        <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Transparent black background
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationMessage: {
    color: COLORS.white,
    fontSize: 14,
  },
  notificationImage: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 5,
  },
  closeButton: {
    marginLeft: 10,
  },
  closeText: {
    color: COLORS.white,
    fontSize: 18,
  },
});

export default CustomNotification;
