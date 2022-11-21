import React, { Component, useState } from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AwesomeLoading from 'react-native-awesome-loading';

function GetRewardsScreen() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Get Rewards</Text>
      </View>
    );
  }
  
function EarnIKCashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Earn IK Cash</Text>
    </View>
  );
}

const Tab = createMaterialTopTabNavigator();

const SmileScreen = () => {
  
  const [loading, setLoading] = useState(false);

  return (
    <View style={{
        width: '100%',
        height: '100%'
      }}>
    
        <AwesomeLoading indicatorId={1} size={50} isActive={loading} text="" />
    
        <WebView
            source={{
              uri: 'https://myconcertdirect.com/pages/loyalty-reward'
            }}
            style={{ marginTop: 0 }}
            onLoadStart={ () => { setLoading(true); } }
            onLoad={ () => { setTimeout( () => {
              setLoading(false);
            }, 5000)  } }
            onNavigationStateChange={ () => {}}
            onMessage={
              () => {}
            }
        />
    
      </View>
  );
}

export default SmileScreen;

const styles = StyleSheet.create({
    backImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#eeeeee',
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        marginBottom: 0,
    },
    headerText: {
        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
    },
    bodyContainer: {
        flex: 1,
        marginLeft: 24,
        marginRight: 24,
        marginBottom: 8,
        backgroundColor: '#ffffffff', 
    },
    bodyTitleText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#555555',
        fontSize: 18,
        marginLeft: 24,
        marginEnd: 24,
        marginTop: 24,
    },
    createBtnContainer: {
        padding: 16,
        marginLeft: 16,
        marginRight: 16,
        marginBottom: 0,
        borderRadius: 2,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        backgroundColor: '#000',
    },
});