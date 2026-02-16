import { View, Image, StyleSheet, Text } from "react-native";
import vectorImage from "./src/assets/smarticon.png";
export default function SplashScreen() {
    
    return (
    <View style={styles.container}>
      <Image source={vectorImage} style={styles.image} />
      <Text style={styles.title}>Smart Anemia Scan</Text>
    </View>
  );
      
}

const styles = StyleSheet.create( {
container: {
    flex: 1,
        justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#33E4DB",
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


