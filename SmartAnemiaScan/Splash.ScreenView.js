import { View, Image, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import vectorImage from "./src/assets/smarticon.png";

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={['#33E4DB', '#00BBD3']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Image source={vectorImage} style={styles.image} />
      <Text style={styles.title}>Smart Anemia Scan</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: "cover",
  },
  title: {
    marginTop: 20,
    fontSize: 25,
    fontWeight: "bold",
    color: "#ffffff",
  },
});


