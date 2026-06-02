import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vytal</Text>
      <Text style={styles.subtitle}>
        Intelligent management for CrossFit boxes
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080c0a",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#dceee0",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b8c72",
    marginTop: 12,
  },
});
