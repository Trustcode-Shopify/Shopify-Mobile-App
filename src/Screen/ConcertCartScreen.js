/* eslint-disable */
import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {AsyncStorage } from 'react-native';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  FlatList,
  TextInput,
  Linking,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import Toast from 'react-native-toast-message';
import {Icon, CheckBox} from 'react-native-elements';
import {SafeAreaView} from 'react-native-safe-area-context';
import allActions from '../stores/actions';
import client from '../service/client';

import Spinner from 'react-native-loading-spinner-overlay';

const ConcertCartScreen = ({navigation, route}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [checked, updateChecked] = useState(true);
  const [checked1, updateChecked1] = useState(true);
  const [title, setTitle] = useState('');
  const [flag, setFlag] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const dispatch = useDispatch();
  const checkoutId = useSelector((state) => state.checkout?.checkoutItem?.id);
  const checkout = useSelector((state) => state.checkout?.checkoutItem);
  const cartItem = useSelector((state) => state.checkout?.checkoutItem?.lineItems);
  
  useEffect( async () => {
    setDataSource(cartItem)
    setFlag(prev => !prev)
  }, [cartItem])

  useEffect( async () => {
    setDataSource(cartItem)
  }, []) 

  useEffect(async () => {
    setWaiting(false);
  }, [cartItem]);

  const goBack = async () => {
    navigation.goBack();
  };

  const goContinue = () => {
    navigation.navigate({name: 'WebView', params: {url: checkout.webUrl}})
  };

  const editItemCart = async () => {
    navigation.push(route.params.name)
  };

  const removeItemFromCart = async () => {
    const lineItemIdsToRemove = [];
    dataSource.map((item) => {
      lineItemIdsToRemove.push(item.id)
    })
    
    client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
      dispatch(allActions.checkoutAction.addItemCart(checkout));
    }).catch(err => {
      // console.log(err);
      setWaiting(false);
      return;
      if(err) Toast.show({
        type: 'error',
        text1: 'Instant Karma',
        text2: 'Connection Error! Please try again!',
      });
    });;
  };

  const updateQuantityInCart = async (lineItemId, quantity) => {
    setWaiting(true);
    const lineItemsToUpdate = [{id: lineItemId, quantity: parseInt(quantity, 10)}]
    return client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then(checkout => {
      dispatch(allActions.checkoutAction.addItemCart(checkout));
    }).catch(err => {
      // console.log(err);
      setWaiting(false);
      return;
      if(err) Toast.show({
        type: 'error',
        text1: 'Instant Karma',
        text2: 'Connection Error! Please try again!',
      });
    });;
  }

  const decrementQuantity = async (item) => {
    const updatedQuantity = item.quantity - 1
    updateQuantityInCart(item.id, updatedQuantity);
  }

  const incrementQuantity = async (item) => {
    const updatedQuantity = item.quantity + 1
    updateQuantityInCart(item.id, updatedQuantity);
  }

  const removeItem = async (item) => {
    setWaiting(true);
    updateQuantityInCart(item.id, 0);
  }

  const onChange = async (type, item) => {
    setWaiting(true);
    if (type == '+') {
      incrementQuantity(item);
    } else {
      decrementQuantity(item);
    }
  }
  
  return (
    <SafeAreaView style={styles.container}>
        <Spinner
          visible={waiting}
          opacity={0.9}
        />
        <View style={styles.topside}>
          <TouchableOpacity>
            <View style={styles.topDiv}>
              <Text style={styles.text1}>Review order</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtnContainer} onPress={goBack}>
            <Image source={require('../res/imgs/back_black.png')} />
          </TouchableOpacity>
        </View>

        <View style={styles.topside}>
          <View style={styles.timeDiv}>
            <View style={styles.subTimeDiv1}>
              <Text style={styles.timeTitle}>When</Text>
              <Text style={styles.timeTitle}>Today</Text>
              {/* {!checked && <Text>ASAP to 4:23PM</Text>} */}
            </View>
            <View style={styles.subTimeDiv2}>
              <Text style={styles.timeTitle}>Where</Text>
              <CheckBox
                disabled={true}
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                title="Skip the lines & pick up at event"
                containerStyle={styles.StyledCheck}
                checked={!checked1}
                checkedColor='#000'
                textStyle={{fontWeight: '300', fontSize: 14, opacity: 0.5}}
                onPress={() => updateChecked1(!checked1)}
              />
              <CheckBox              
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                title="Ship to me"
                checkedColor='#000'
                containerStyle={styles.StyledCheck}
                textStyle={{fontWeight: '300', fontSize: 14}}
                checked={checked}
                onPress={() => updateChecked(!checked)}
              />
            </View>
          </View>
        </View>
        <View style={styles.itemWrapper}>
          <FlatList
            data={dataSource}
            extraData={dataSource}
            style={styles.cartItemWrapper}
            renderItem={({item}) => (
              <View style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "flex-start",
                borderWidth: 0,
                width: "100%",
                flexDirection: "row",
                marginBottom: 15,
                height: 180
              }}>
                <Image
                  style={{
                    height: "100%",
                    width: "35%",
                    height: 180,
                    resizeMode: "stretch"
                  }}
                  source={{uri: item.variant.image.src.split('?')[0]}}
                />
                <View style={{
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  alignItems: 'stretch',
                  padding: 0,
                  margin: 0,
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "40%"
                }}>

                  <Text>
                    <Text style={styles.cartItemTitle}>
                      {item.title}
                    </Text>
                  </Text>
                  <Text style={{fontSize: 14}}>
                    {(item.variant.title != 'Default Title') && `${item.variant.title}`}
                  </Text>
                  <Text style={{fontSize: 14}}>
                    { `$${item.variant.price} `}
                  </Text>
                  <View style={{
                      flex: 1,
                      justifyContent: "flex-start",
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "row"
                    }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: "#ddd",
                          height: 40,
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 40,
                          borderRightWidth: 0
                        }}
                        onPress={() => decrementQuantity(item)}>
                        <Icon name="remove" iconStyle={{color: '#a6a6a6'}} />
                      </TouchableOpacity>
                      <TextInput 
                          style={{
                            width: 40,
                            height: 40,
                            borderWidth: 1,
                            borderColor: "#ddd",
                            textAlign: "center"
                          }}
                          onChangeText={(quantity) =>
                            updateQuantityInCart(item.id, quantity)
                          }
                          value={`${item.quantity}`}
                        />
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: "#ddd",
                          height: 40,
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 40,
                          borderLeftWidth: 0
                        }}
                        onPress={() => incrementQuantity(item)}>
                        <Icon name="add" iconStyle={{color: '#a6a6a6'}} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => removeItem(item)}>
                        <Icon name="delete" iconStyle={{color: '#999'}} />
                      </TouchableOpacity>
                  </View>
                  
                </View>
                <View>
                  <Text style={{fontSize: 16, fontWeight: "700"}}>
                    { `$${item.variant.price * item.quantity} `}
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={<View style={{margin: 230}}></View>}
            numColumns={1}
            keyExtractor={(item, index) => index}
          />
        </View>       
        <View style={styles.bottomDiv}>
          <View style={styles.valueText}>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>subtotal:</Text>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#000'}}>
              ${checkout.paymentDue}
            </Text>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={goContinue}>
            <Text style={styles.text2}>CONTINUE</Text>
          </TouchableOpacity>
        </View>     
    </SafeAreaView>
  );
};

export default ConcertCartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fff',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  imageThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderRadius: 2,
  },
  topside: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 18,
    paddingLeft: 18,
  },
  timeDiv: {
    paddingBottom: 20,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
  },
  subTimeDiv1: {
    flex: 0.5,
  },
  subTimeDiv2: {
    flex: 0.5,
  },
  timeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  text1: {
    color: '#000',
    fontSize: 28,
    marginLeft: 12,
  },
  topDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
    borderRadius: 1,
    paddingBottom: 20,
    paddingTop: 10,
  },
  cardDiv: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 4,
    marginTop: 4,
    marginBottom: 4,

  },
  radio: {
    width: 16,
    height: 16,
  },
  div1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  div2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editBtn: {
    borderRadius: 25,
    borderColor: '#a6a6a636',
    borderWidth: 2,
    padding: 8,
    marginLeft: 8
  },
  continueBtn: {
    padding: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 30,
  },
  text2: {
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'black',
  },
  valueText: {
    flexDirection: 'row',
    backgroundColor: '#DDDDDD',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 4,
  },
  bottomDiv: {
    position: 'absolute',
    width: '100%',
    paddingRight: 16,
    paddingLeft: 16,
    bottom: 0
  },
  StyledCheck: {
    backgroundColor: '#00000000',
    borderWidth: 0,
    marginLeft: -12,
    paddingTop: 0,
    paddingBottom: 0,
  },
  backBtnContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingTop: 10,
  },
  cartItemWrapper: {
    paddingLeft: 4,
    width: "100%",
    paddingLeft: 15,
    borderColor: '#a6a6a6',
  },
  cartItemPrice: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#000',
    width: '100%',
    textAlign: 'right',
  },
  cartItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cartTitleWrapper: {
    paddingLeft: 4,
    marginLeft: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
  },
  countText: {
    fontSize: 16,
    paddingLeft: 15,
    paddingRight: 15,
    color: '#a6a6a6',
  },
  count: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    minWidth: 35,
    minHeight: 35,
    borderWidth: 1,
    borderColor: '#a6a6a6',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#a6a6a6',
  },
  itemWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 20
  }
});
