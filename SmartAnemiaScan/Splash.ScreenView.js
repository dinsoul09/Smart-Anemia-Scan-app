import { View, Image, StyleSheet } from "react-native";
import vectorImage from "../SmartAnemiaScan/src/assets/smarticon.png";
export default function SplashScreen() {
    
    return (
        <View style = {styles.container}> 
        <View>
        <Image source={vectorImage} style={styles.image} />
        </View>
        </View> 
    );
}

const styles = StyleSheet.create( {
container: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: '#33E4DB',
},
image: {
    width:300, 
    height:300, 
    resizeMode: "cover"
},
});


