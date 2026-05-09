import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image,} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    return(
        <SafeAreaView style={styles.container}>
            <Text>Teste</Text>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
   container:{
    flex: 1,
    paddingLeft: 20,
    paddingTop: 10,
   }
});