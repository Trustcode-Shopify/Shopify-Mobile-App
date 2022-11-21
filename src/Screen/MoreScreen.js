import React, { Component, useState, createRef } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
  } from 'react-native';

import {SHOP_URL, API_URL, ACCESS_TOKEN} from '../config/config';
import allActions from '../stores/actions';

import AwesomeLoading from 'react-native-awesome-loading';
import Toast from 'react-native-toast-message';

export default function MoreScreen({navigation}){
    
    const dispatch = useDispatch();   
    const auth_state = useSelector((state) => state.auth.auth_state);
    const [loading, setLoading] = useState(false);
    const signout = () => {
        dispatch(allActions.customerAction.signout_customer());
        navigation.navigate('Home');
    }
    const cartItem = useSelector((state) => state.checkout?.checkoutItem?.lineItems)
    const goBack = () => {
        navigation.goBack();
    };

    const goToConcertCart = () => {
        navigation.navigate({name: 'ConcertCart', params: {name: route.name}});
    };
    const cartItemsLength = () => {
        let count = 0;
        cartItem.map( item => {
          count += item.quantity;
        });
        return `${count}`;
    }
    return (
        
        <View style={styles.container}>
            <AwesomeLoading indicatorId={1} size={50} isActive={loading} text="" />
            <ImageBackground
                style={styles.backImage}
                source={require('../res/imgs/background.png')}>
        
                <SafeAreaView>  
                    <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backBtnContainer} onPress={goBack}>
                        <Image source={require('../res/imgs/back_black.png')} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>My Account</Text>
                    <TouchableOpacity
                        style={styles.cartBtnContainer}
                        onPress={goToConcertCart}>

                        <ImageBackground
                        style={styles.cartBtnBack}
                        source={require('../res/imgs/cart_num_back_black.png')}>
                        <Text style={styles.cartNumText}>{cartItemsLength()}</Text>
                        </ImageBackground>
                    
                    </TouchableOpacity>
                    </View> 
                    <TouchableOpacity 
                        style={styles.serviceBtnContainer}
                        onPress={
                            () => {
                                if (!auth_state) {
                                    navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account/login", delayTime: 3 }});
                                } else {
                                    navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account", delayTime: 3 }});
                                }
                            }
                        }
                        >
                        <Text style={styles.serviceBtnText}>Orders</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={styles.serviceBtnContainer}
                        onPress={
                            () => {
                                if (!auth_state) {
                                    navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account/login"}});
                                } else {
                                    navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account/addresses"}});
                                }
                                return;
                            }
                        }
                        >
                        <Text style={styles.serviceBtnText}>Payment Detail</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.serviceBtnContainer}
                        onPress={
                                () => {
                                    if (!auth_state) {
                                        navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account/login", delayTime: 3}});
                                    } else {
                                        navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account/addresses", delayTime: 3}});
                                    }
                                }
                            }
                        >
                        <Text style={styles.serviceBtnText}>Addresses</Text>
                    </TouchableOpacity>
                    { auth_state &&
                        <TouchableOpacity
                            style={styles.serviceBtnContainer}
                            onPress={() => {
                                navigation.navigate({name: 'WebViewMore', params: {url: "https://myconcertdirect.com/account/logout", action: 'logout',  redirectTo: "More", delayTime: 3}});
                                // navigation.navigate('Home');
                            }}
                            >
                            <Text style={styles.serviceBtnText}>Sign Out</Text>
                        </TouchableOpacity>
                    }
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    backImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#eeeeee',
    },
    headerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        marginBottom: 24,
        backgroundColor: "#ffffff95"
    },
    headerText: {
        color: 'black',
        fontSize: 24,
        fontWeight: 'bold',
    },
    serviceBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        padding: 16,
        marginLeft: 64,
        marginRight: 64,
        borderRadius: 8,
        backgroundColor: '#ffffff90',
    },
    serviceBtnText: {
        color: '#555555',
        fontSize: 24,
        fontWeight: 'bold',
    },
    cartBtnContainer: {
		position: 'absolute',
		top: 28,
		right: 24,
		width: 40,
		height: 48,
	},
    cartBtnBack: {
		width: '100%',
		height: '100%',
    },
    cartNumText: {
		top: Platform.OS === 'ios' ? 16:0,
		textAlign: 'center',
		textAlignVertical: 'center',
		height: '100%',
		color: '#FFF',
    },
    backBtnContainer: {
		position: 'absolute',
		top: 30,
		left: 20,
		paddingTop: 10,
	},
});