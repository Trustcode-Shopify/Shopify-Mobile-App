import React, { Component, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    ImageBackground,
  } from 'react-native';

import {SHOP_URL, API_URL, ACCESS_TOKEN} from '../config/config';
import { WebView } from 'react-native-webview';
import AwesomeLoading from 'react-native-awesome-loading';
import {useSelector, useDispatch} from 'react-redux';
import allActions from '../stores/actions';

const SkypilotScreen = () => {

    const auth_state = useSelector((state) => state.auth.auth_state);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    
    const onMessage = (arg) => {

      console.log('WebViewData', arg);
  
      // data = JSON.parse(data.data);
      data = JSON.parse(arg.nativeEvent.data);
      
      console.log(data);
      
      if(data && data.action == 'signin' && data.email != '' && data.password != '') {
      
        fetch(API_URL, {
    
          method: 'POST',
    
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN
          },
    
          body: JSON.stringify({
            "query": "mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) { customerAccessTokenCreate(input: $input) {customerUserErrors {code, field, message} customerAccessToken { accessToken, expiresAt } } }",
              "variables": {
                "input": {
                  "email": `${data.email}`,
                  "password": `${data.password}`
                }
              }
            }),
    
        }).then(res => {
    
          return res.json()
    
        }).then(res => {
    
          if (res.data.customerAccessTokenCreate.customerAccessToken && res.data.customerAccessTokenCreate.customerAccessToken.accessToken != null) {
    
            dispatch(allActions.customerAction.signin_customer({
              email: data.email,
              pass: data.password,
              token: res.data.customerAccessTokenCreate.customerAccessToken.accessToken,
              expiresAt: res.data.customerAccessTokenCreate.customerAccessToken.expiresAt
            }));
    
          }
    
        })
  
      }
    
    }

    return (
        <View style={{
          width: '100%',
          height: '100%'
        }}>
          <AwesomeLoading indicatorId={1} size={50} isActive={loading} text="" />
          <WebView
              source={{
                uri: (auth_state?'https://myconcertdirect.com/apps/downloads/orders/':"https://myconcertdirect.com/account/login")
              }}
              style={{ marginTop: 0 }}
              onLoadStart={ () => { setLoading(true); } }
              onLoadEnd={ () => { setLoading(false); } }
              onMessage={
                onMessage
              }
          />
        </View>
      )
};

export default SkypilotScreen;

const styles = StyleSheet.create({
    backImage: {
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
        backgroundColor: '#ffffffa0', 
    },
    item: {
        width: '100%',
        height: 150,
        marginBottom: 24,
    },
    cartItemImage: {
        width: 150,
        height: 150,
        borderWidth: 0.5,
        borderColor: 'gray',
        resizeMode: 'contain',
        marginEnd: 16,
    },
    itemTitleText: {
        fontSize: 18,
        marginTop: 8,
        fontWeight: 'bold',
        color: '#555555'
    },
    itemDateText: {
        fontSize: 13,
        marginTop: 8,
        color: '#555555'
    },
    itemDetailText: {
        flex: 1,
        fontSize: 13,
        marginEnd: 16,
        color: '#555555'
    },
    itemButton: {
        width: 24,
        height: 24,
        marginRight: 12,
        marginTop: 4,
    },
    itemButtonsView: {
        flex: 1,
        marginLeft: 12,
    }
});