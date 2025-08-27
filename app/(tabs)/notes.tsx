import { StyleSheet, Text, View } from 'react-native';

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📝 Notes Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 22,
    color: '#f4d03f',
  },
});
