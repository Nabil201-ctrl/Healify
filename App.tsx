import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,TextInput
  KeyboardAvoidingView,
  Platform,
  Pressable
 } from 'react-native';

export default function App() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style= {styles.SignIn}>SignIn</Text>
      <StatusBar style="auto" />

      <TextInput style={styles.input} placeholder="Email"  autoFocus={true} autoCapitalize='none' keyboardType='email-address' autoComplete='email'/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry autoFocus={true}/>
      <Pressable onPress={() => console.log('SignIn')} style={styles.button}>
        <Text style={styles.buttonText}>SignIn</Text>
      </Pressable>


    </KeyboardAvoidingView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  SignIn:{
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  input:{
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  button:{
    backgroundColor: '#000',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonText:{
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});
