import React, { Component, useState } from 'react';
import { WebView } from 'react-native-webview';
import AwesomeLoading from 'react-native-awesome-loading';
import { View } from 'react-native';
import allActions from '../stores/actions';
import {useSelector, useDispatch} from 'react-redux';
import {SHOP_URL, API_URL, ACCESS_TOKEN} from '../config/config';

const _WebViewScreen = (props) => {

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onMessage = (arg) => {

    // console.log('WebViewData', arg);

    // data = JSON.parse(data.data);
    data = JSON.parse(arg.nativeEvent.data);
    
    // console.log('data = ', data);
    
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
    
    if(data && data.action == 'goback') {
      console.log('go back');
      props.navigation.navigate({
        name: "More"
      })
    }

  }

  const onNavigationStateChange = (webViewState) => {
    
    console.log('site url = ', webViewState.url);

    if (webViewState.url == 'https://myconcertdirect.com/account/logout') {
      dispatch(allActions.customerAction.signout_customer());
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
            uri: props.route.params.url
          }}
          style={{ marginTop: 0 }}
          onLoadStart={ () => { setLoading(true); } }
          onLoad={ () => { 
            setTimeout( () => {
              setLoading(false); if ( props.route.params.action == 'logout' ) { 
                
                console.log('logout event = ');
                
                dispatch(allActions.customerAction.signout_customer()); 
                setTimeout(() => {
                  props.navigation.navigate({
                    name: "More"
                  })
                }, 100)
              } 
            }, props.route.params.delayTime ? props.route.params.delayTime * 1000 : 0 );
          } }
          onNavigationStateChange={onNavigationStateChange}
          onMessage={
            onMessage
          }
      />
  
    </View>
  
  )

}

export default _WebViewScreen;