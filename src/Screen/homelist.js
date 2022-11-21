/* eslint-disable */
import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Text,
  Animated,
  FlatList,
  Linking,
  Platform,
} from 'react-native';
import {
  Overlay,
  ButtonGroup,
  BottomSheet,
} from 'react-native-elements';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConcertCartScreen from './ConcertCartScreen';
import allActions  from '../stores/actions';
import client from '../service/client';
import AwesomeLoading from 'react-native-awesome-loading';
import { Button } from 'react-native-elements/dist/buttons/Button';
import Spinner from 'react-native-loading-spinner-overlay';
import { Dropdown } from 'react-native-element-dropdown';


const ConcertSelectScreen = ({navigation, route}) => {
  const [dataSource, setDataSource] = useState([]);
  const [cartVariantSource, setCartVariantSource] = useState([]);
  const [variantOptionSource, setVariantOptionSource] = useState([]);
  const [variantProductImages, setVariantProductImages] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedOptionsIndexObj, setSelectedOptionsIndexObj] = useState(null);
  const [selectedVariantImage, setSelectedVariantImage] = useState(null);
  const [selectedVariantProduct, setSelectedVariantProduct] = useState(null);
  const [productLargeImageVisible, setProductLargeVisible] = useState(false);
  const [productLargeImageObj, setProductImageObj] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [sliderVisible, setSliderVisible] = useState(false);
  const [TabName, setTabName] = useState('ARTIST');
  const [refineTab, setRefineTab] = useState(null);
  const [flag, setFlag] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [artistList, setArtistList] = useState([]);
  const [productTypeList, setProductTypeList] = useState([]);

  const proudctObj = useSelector((state) => state.product);
  const checkout = useSelector((state) => state.checkout?.checkoutItem)
  const checkoutId = useSelector((state) => state.checkout?.checkoutItem?.id)
  const cartItem = useSelector((state) => state.checkout?.checkoutItem?.lineItems)
  const title = useSelector((state) => state.navigations.eventTitle)
  const {collections} = useSelector((state) => state.collection.collections)

  const dispatch = useDispatch();

  let timeout = null;

  useEffect( () => {
	
	let tempArtistList = [ { label: "Shop All", value: "__all" } ];
	let tempTypeList = [];

	proudctObj.products.map( item => {

		// console.log(item);
		// console.log(item.priceV2);

		if ( tempArtistList.findIndex(artist => artist.value == item.vendor) < 0 ) 
			tempArtistList.push({ label: `${item.vendor}`, value: `${item.vendor}` });
		
		if ( tempTypeList.findIndex(type => type.value == item.productType) < 0 ) 
			tempTypeList.push({ label: `${item.productType}`, value: `${item.productType}` });

		// console.log("Temp Artist List ======== ", tempArtistList);
		// console.log("Temp Type List ======== ", tempTypeList);
		
		setArtistList(tempArtistList);
		setProductTypeList(tempTypeList);
	});

  }, [proudctObj]);

  useEffect(async () => {
    // setDataSource(proudctObj.products.filter(item => item.images.length > 0 ));
	productLoad(TabName);
    setCartVariantSource(cartItem);
  }, []);

  useEffect(() => {
    setCartVariantSource(cartItem);
  }, [cartItem])

  useEffect( async () => {
	setWaitingWithFlag(false);
  }, [dataSource, cartItem])

  const goBack = async () => {
    navigation.goBack();
  };
  
  const goToConcertCart = async () => {
    navigation.navigate({name: 'ConcertCart', params: {name: route.name}});
  };

  const addVariantToCart = async (product) => {
    
	if (cartVariantSource.length > 15) {
	
		alert("Can't add concert item to cart anymore");
    
	} else {
      
		if (product.availableForSale) {
        
			setSelectedProduct(product);
			
			if (product.options.filter(option => option.name !== 'Title').length > 0) {

				setVariantOptionSource(product.options.filter(option => option.name !== 'Title'));
				
				let defaultOptionValues = {};
				let defaultIndexObj = {};
				let defaultProductImage = [];
				
				product.options.forEach((selector) => {
					defaultOptionValues[selector.name] = selector.values[0].value;
					defaultIndexObj[selector.name] = 0;
				});
				defaultProductImage = product.variants[0]?.image.src;

				setSelectedOption(defaultOptionValues);
				setSelectedOptionsIndexObj(defaultIndexObj);
				setSelectedVariantImage(defaultProductImage);
				setSelectedVariantProduct(product.variants[0]);

				toggleOverlay();
		
			} else {
				setWaitingWithFlag(true);
				const variantId = product.variants[0].id;
				const lineItemsToAdd = [{variantId, quantity: 1}];
		
				return client.checkout.addLineItems(checkoutId, lineItemsToAdd).then(res => {
					
					dispatch(allActions.checkoutAction.addItemCart(res));
					setVisible(false);
					return;
					if(err) Toast.show({
						type: 'error',
						text1: 'Instant Karma',
						text2: 'Connection Error! Please try again!',
					});
				}).catch(err => {
					// console.log(err);
					setWaitingWithFlag(false);
				});	
			}
    
		} else {
		
			Toast.show({
				type: 'error',
				text1: 'Instant Karma',
				text2: 'Sold out!',
			});
		}
    }
  };

  const addToCart = async () => {
	setWaitingWithFlag(true);
    const selectedVariant = client.product.helpers.variantForOptions(selectedProduct, selectedOption);
    const variantId = selectedVariant.id;
    const lineItemsToAdd = [{variantId, quantity: 1}];
    
    return client.checkout.addLineItems(checkoutId, lineItemsToAdd).then(res => {
		
		dispatch(allActions.checkoutAction.addItemCart(res));
		setVisible(false);
    }).catch(err => {
		// console.log(err);
		setWaitingWithFlag(false);
		return;
		if(err) Toast.show({
			type: 'error',
			text1: 'Instant Karma',
			text2: 'Connection Error! Please try again!',
		});
	});
  }


  const updateQuantityInCart = async (lineItemId, quantity) => {
    setWaitingWithFlag(true);
    const lineItemsToUpdate = [{id: lineItemId, quantity: parseInt(quantity, 10)}]
    return client.checkout.updateLineItems(checkoutId, lineItemsToUpdate).then(checkout => {
      dispatch(allActions.checkoutAction.addItemCart(checkout));
    }).catch(err => {
    //   console.log(err);
      setWaitingWithFlag(false);
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

  const removeVariantFromCart = async (index, item) => {
    const lineItemIdsToRemove = [ item.id ];
	decrementQuantity(item);
	return;
    client.checkout.removeLineItems(checkoutId, lineItemIdsToRemove).then((checkout) => {
		dispatch(allActions.checkoutAction.addItemCart(checkout));
    }).catch(err => {
		// console.log(err);
		setWaitingWithFlag(false);
		return;
		if(err) Toast.show({
			type: 'error',
			text1: 'Instant Karma',
			text2: 'Connection Error! Please try again!',
		});
	});
  };

  const goCheckout = async () => {
    navigation.navigate({name: 'WebView', params: {url: checkout.webUrl}});
  };

  const toggleOverlay = () => {
    setVisible(true);
  };

  const toggleOverlayPrductImage = () => {
    setProductLargeVisible(false);
	setProductImageObj(null);
  };

  const closeOverlay = () => {
    setVisible(false);
  }

  const closeOverlayProductImage = () => {
    setProductLargeVisible(false);
	setProductImageObj(null);
  }

  const updateIndex = async (selectedIndex, option) => {
    
	let selectedOptions = selectedOption;
    let selectedOptionsIndex = selectedOptionsIndexObj;
    
	selectedOptions[option.name] = option.values[selectedIndex].value
    selectedOptionsIndex[option.name] = selectedIndex;
	
	let selectedVariantProductObj = selectedProduct.variants.find( item => {
		let matchOptions = item.selectedOptions.filter( opt => opt.value == selectedOptions[opt.name] );
		return matchOptions.length === item.selectedOptions.length;
	});

	setSelectedVariantImage(selectedVariantProductObj.image? selectedVariantProductObj.image.src : selectedProduct.variants[0].image.src);
	setSelectedVariantProduct(selectedVariantProductObj ? selectedVariantProductObj : selectedProduct.variants[0]);
    setSelectedOptionsIndexObj(selectedOptionsIndex);
    
	setFlag( prev=> !prev)
  }
  const cartItemsLength = () => {
    let count = 0;
    cartItem.map( item => {
      count += item.quantity;
    });
    return `${count}`;
  }
  
  const convertVariant = (values) => {
    return values.map(item => item.value);
  }

  const viewProductImage =  (product) => {
	setProductImageObj(product);
	setProductLargeVisible(true);
  }

  const ToogleCart = () => {
	setCartVisible(!cartVisible);
  }
  
  const setWaitingWithFlag = ( bool )  => {
	setWaiting(bool);
	if (bool == true) timeout = setTimeout(() => {
		setWaiting(false);
	}, 5000);
	else clearTimeout(timeout);
  }
  
  const productLoad = async (productType, vendor) => {
	
	setWaitingWithFlag(true);

	if (productType == 'ALL') {
		
		let tempArr = proudctObj.products.filter( 
			item => item.images.length > 0
		)

		tempArr.sort( (a, b) => a.name > b.name );

		setDataSource(tempArr);

		setTabName(productType);
		setRefineTab(productType);
	
	} else if (productType == 'ARTIST') {
		
		let tempArr = proudctObj.products.filter( 
			item => item.images.length > 0 && (item.vendor == vendor || vendor == '__all' || vendor == null)
		)

		tempArr.sort( (a, b) => a.name > b.name );

		setDataSource(tempArr);

		setTabName(productType);
		setRefineTab(productType);

	} else if (productType == "MERCH") {
		setDataSource(proudctObj.products.filter(item => item.images.length > 0 && item.availableForSale == true ));
		setTabName(productType);
		setRefineTab(productType);
	}
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.backImage}
        source={require('../res/imgs/background.png')}>
        <Spinner
          visible={waiting}
		  opacity={0.9}
        />
		<SafeAreaView style={{marginBottom: 20}}>
			
			<View style={styles.headerContainer}>
			
			<Text style={styles.headerText}>Instant Karma™</Text>
			
			{/* <TouchableOpacity style={styles.backBtnContainer} onPress={goBack}>
				<Image source={require('../res/imgs/back_black.png')} />
			</TouchableOpacity>
			*/}

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
			
			<View style={styles.productbox}>
				
				<View style={styles.productTabHeader}>
					
					{/* {console.log(artistList)} */}
					
					<Text style={{
						fontSize: 15
					}}> Refine By Artist </Text>

					<View style={ styles.tab_pane_1_selected } >
					
						<Dropdown
							style={styles.dropdown}
							placeholderStyle={styles.placeholderStyle}
							selectedTextStyle={styles.selectedTextStyle}
							inputSearchStyle={styles.inputSearchStyle}
							iconStyle={styles.iconStyle}
							data={artistList}
							search={false}
							maxHeight={300}
							labelField="label"
							valueField="value"
							placeholder="ARTIST"
							searchPlaceholder="Search..."
							value={'__all'}
							onChange={item => {
								productLoad('ARTIST', item.value);
							}}
						/>
					</View>

					{/* <TouchableOpacity style={ refineTab == "ALL" ? styles.tab_pane_1_selected : styles.tab_pane_1 } onPress={() => { productLoad('ALL') }}>
						<Text style={ refineTab == "ALL" ? styles.tabColorActive : styles.tabColor} >
							SHOP ALL
						</Text>
					</TouchableOpacity> */}
				</View>

				<FlatList
					data={dataSource}
					style={{paddingLeft: 0, paddingRight: 0, paddingTop: 20, backgroundColor: "#fff"}}
					renderItem={ ({item}) => (
						
						<View
							style={styles.productWrapper}
						>
							<TouchableOpacity onPress={() => viewProductImage(item)} style={ styles.viewLargeProductImageButton}> 
								<Image style={{width:12, height: 12}} source={require('../res/imgs/magnifier-icon.png')}></Image>
							</TouchableOpacity>

							<Image style={styles.imageThumbnail} source={{uri: item.images[0]?.src.split('?')[0]}} />
							
							<Text style={styles.productTitle}>
								{item.title}
							</Text>

							<View style={{
								marginTop: 3 ,
								textAlign: 'left',
								width: '100%',
								fontSize: 12,
								color: item.variants[0].compareAtPrice ? "#ff0000" : "#000",
								display: 'flex',
								flexDirection: "row"
							}} >
								<Text style={{
									marginTop: 3 ,
									textAlign: 'left',
									fontSize: 12,
									color: item.variants[0].compareAtPrice ? "#ff0000" : "#000",
								}}>

									${item.variants[0].price}  
								</Text>

								{ item.variants[0].compareAtPrice != null && 
									<Text 
										style={{
											marginTop: 3 ,
											textAlign: 'left',
											width: '100%',
											fontSize: 12,
											marginLeft: 25,
											color: "#000",
											textDecorationLine: "line-through",
											textDecorationStyle: "solid",
											marginLeft: 10
										}}
									>
										${item.variants[0].compareAtPrice}
										
									</Text>
								}
							</View>
							
							{ item.availableForSale == true &&
								<TouchableOpacity onPress={() => addVariantToCart(item)} style={ styles.addtoCartButtonBox}> 
									<Image style={{width:15, height: 15, marginRight: 5}} source={require('../res/imgs/cart-icon.png')}></Image>
									<Text style={{color:"#fff", fontSize: 12}}>Add to Cart</Text> 
								</TouchableOpacity>
							}

							{ item.availableForSale == false &&
								<View  style={ styles.soldoutButtonBox}> 
									<Text style={{color:"#000", fontWeight: "bold", fontSize: 12}}>Sold Out</Text> 
								</View>
							}

						</View>
					
					)}
					numColumns={2}
					keyExtractor={(item, index) => index}
					ListFooterComponent={<View style={{margin: 200}}></View>}
				/>
			
				{ cartItem.length > 0 && 
					<View style={ cartVisible ? styles.cartContainer : styles.cartContainerCollapse }>
						
						<View style={{
							width: "100%",
							position: "relative",
							height: 40,
							backgroundColor: "#fff",
							marginBottom: 0,
							flex: 0,
							justifyContent: "center",
							alignItems: "center"
						}}>
							<Text style={{fontSize: 16, fontWeight: "bold"}}> Cart </Text>
							<TouchableOpacity style={{
								position: "absolute",
								right: 0,
								top: 0,
								backgroundColor: "#000",
								height: "100%",
								width: 50,
								flex: 1,
								justifyContent: "center",
								alignItems: "center"
							}}
							onPress={() => {ToogleCart()}}
							>
								<Image
									source={ cartVisible ? require('../res/imgs/arrow_down.png') : require('../res/imgs/arrow_up.png') }
									style={{
										width: 25,
										height: 16
									}} />
							</TouchableOpacity>
						</View>

						{
							cartVisible &&
							<FlatList
								data={cartVariantSource}
								style={styles.cartItemWrapper}
								renderItem={({item, index}) => (
								<TouchableOpacity
									style={styles.cartItem}
									onPress={() => removeVariantFromCart(index, item)}>
									<Image
									source={{uri: item.variant.image.src.split('?')[0]}}
									style={styles.cartItemImage} />
									<View style={styles.quantityWrapper}>
									<Text style={styles.quantityText}>{item.quantity}</Text>
									</View>
									<Text style={styles.sizeText}>
									{ (item.variant.selectedOptions.find((item) => item.name === 'Size')?.value === 'Small' ||
										item.variant.selectedOptions.find((item) => item.name === 'Size')?.value === 'Medium' ||
										item.variant.selectedOptions.find((item) => item.name === 'Size')?.value === 'Large')
										? item.variant.selectedOptions.find((item) => item.name === 'Size')?.value.substr(0, 1)
										: item.variant.selectedOptions.find((item) => item.name === 'Size')?.value.substr(0, 3)                  
									}
									</Text>
								</TouchableOpacity>
								)}
								horizontal
								keyExtractor={(item, index) => index}
								ListFooterComponent={<View style={{margin: 100}}></View>}
							/>
						}

						{
							cartVisible && 
							<Text style={styles.tapItemText}>
								Tap the cart item to remove
							</Text>
						}
						
						{
							cartVisible && 
							<Image
								source={require('../res/imgs/music_bar_black.png')}
								style={{width: '100%', paddingTop: 13, marginTop: -1, backgroundColor: "#fff"}}/>
						}
						
						{
							cartVisible &&
							<TouchableOpacity
								onPress={goToConcertCart}
								style={styles.checkoutButtonWrapper}>
								<Text style={{color: '#fff', fontSize: 16, fontWeight: "bold"}}>Check out</Text>
							</TouchableOpacity>
						}
						
						{
							cartVisible &&
							<BottomSheet modalProps={{}} isVisible={sliderVisible}>
								<ConcertCartScreen Close={() => setSliderVisible(false)} />
							</BottomSheet>
						}					  
					</View>
				}

			</View>

        </SafeAreaView>
      </ImageBackground>

      <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
        <TouchableOpacity
          onPress={closeOverlay}
          style={styles.closeButton}>
          <Ionicons
            name="ios-close-circle-outline"
            size={20}
          />
        </TouchableOpacity>
        <FlatList
          data={variantOptionSource}
          extraData={selectedOptionsIndexObj}
          style={styles.overlayWrapper}
          renderItem={({item, index}) => (
			  <View>
				<Text>Select {item.name}</Text>
				<ButtonGroup
					onPress={(selectedIndex) => updateIndex(selectedIndex, item)}
					selectedIndex={selectedOptionsIndexObj[item.name]}
					buttons={convertVariant(item.values)}
					buttonStyle={{backgroundColor: '#F0F2F8', borderWidth: 0}}
					selectedButtonStyle={{backgroundColor: '#000', borderRadius: 4}}
					innerBorderStyle={{width: 0}}
					textStyle={{fontSize: 14}}
				/>
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <View style={{ marginTop: 10, height: "100%", flex: 1, justifyContent: "center", alignItems: "center", minWidth: "100%"}}>
				
				{ selectedVariantImage != null && 
					<Image style={{
						width: 120,
						height: 200,
						resizeMode: "contain"
					}} source={{uri: selectedVariantImage}} />
				}
				
				{ (selectedVariantProduct && selectedVariantProduct.available == true) &&
					<TouchableOpacity
						onPress={addToCart}
						style={styles.cartButtonWrapper}>
						<Image style={{width:15, height: 15, marginRight: 5}} source={require('../res/imgs/cart-icon.png')}></Image>
						<Text style={{color: '#fff', fontSize: 16}}>Add To Cart</Text>
					</TouchableOpacity>
				}
				
				{ (selectedVariantProduct && selectedVariantProduct.available == false) &&
					<View
						style={styles.soldoutButtonBox}>
						<Text style={{color: '#000', fontWeight: "bold", fontSize: 16}}>Sold Out</Text>
					</View>
				}

            </View>
          }
        />
      </Overlay>

	  <Overlay isVisible={productLargeImageVisible} onBackdropPress={toggleOverlayPrductImage}>
        <TouchableOpacity
          onPress={closeOverlayProductImage}
          style={styles.closeButton}>
          <Ionicons
            name="ios-close-circle-outline"
            size={20}
          />
        </TouchableOpacity>
		<View style={{
			height: 400,
			flexGrow: 0,
			width: 300,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: "#fff",			
			borderRadius: 10,
			overflow: "hidden"
		}}>
			{productLargeImageObj != null && 
				<Image style={{
					width: "100%",
					height: "100%",
					resizeMode: "contain"
				}} source={{uri: productLargeImageObj.images[0]?.src.split('?')[0]}} />
			}
			
		</View>
      </Overlay>

    </View>
  );
};

export default ConcertSelectScreen;

const styles = StyleSheet.create({

	productImageShow: {
		position: "absolute",
		top: 0,
		left: 0,
		zIndex: 999999
	},
	productImage: {
		width: "100%",
		height: "100%",
		resizeMode: "cover"
	},
	viewLargeProductImageButton: {
		position: "absolute",
		top: 5,
		left: 5,
		width: 20,
		height: 20,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#fff",
		zIndex: 999,
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	productTabHeader: {
		flex: 1,
		borderBottomColor: "#eee",
		borderBottomWidth: 1,
		minHeight: 60,
		width: "100%",
		flexDirection: "row",
		paddingLeft: 16,
		paddingRight: 16,
		justifyContent: "space-between",
		alignItems: "center",
	},
	tabColor: {
		color: "#666",
		fontSize: 12
	},
	tabColorActive: {
		color: "#000",
		fontWeight: "bold",
		fontSize: 12
	},
	productboxHeader : {
		width: "100%",
		flex: 1,
		flexDirection: "row",
		height: 60,
		borderBottomColor: "#eee",
		borderBottomWidth: 1,
		paddingTop: 20,
		paddingLeft: 16,
		paddingRight: 16
	},
	addtoCartButtonBox :  {
		flex:1, 
		flexDirection: 'row', 
		width: "100%", 
		backgroundColor: "#000", 
		marginTop: 8,
		borderRadius: 5,
		maxHeight: 30,
		overflow: "hidden",
		height: 30,
		padding: 0,
		justifyContent: "center",
		alignItems: "center"
	},
	soldoutButtonBox : {
		flex:1, 
		flexDirection: 'row', 
		width: "100%", 
		backgroundColor: "#00000000", 
		marginTop: 8,
		borderRadius: 5,
		maxHeight: 30,
		overflow: "hidden",
		height: 30,
		padding: 0,
		borderWidth: 5,
		justifyContent: "center",
		alignItems: "center",
		borderColor: "#00000050"
	},
	addtoCartButton :  {
		height: 30,
		fontSize: 12,
		padding: 0,
		margin: 0
	},
	productbox: {
		backgroundColor: "#fff",
		marginLeft: 16,
		marginRight: 16,
		position: "relative",
		minHeight: "100%"
	},	
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'white',
		height: "100%"
	},
	headerBox: {
		flexBasis: 100
	},
	backImage: {
		width: '100%',
		height: '100%',
		backgroundColor: '#eeeeee'
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
	backBtnContainer: {
		position: 'absolute',
		top: 20,
		left: 20,
		paddingTop: 10,
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
	imageThumbnail: {
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: 160,
		borderRadius: 2,
		resizeMode: 'cover',
		borderWidth: 1,
		borderColor: "#ddd"
	},
	cartContainer: {
		position: 'absolute',
		left: 24,
		right: 24,
		bottom: Platform.OS === 'ios' ? 200 : 230,
		height: 240,
		borderColor: '#000',
		backgroundColor: "#000",
		padding: 5,
		borderRadius: 5,
		borderBottomWidth: 0
	},
	cartContainerCollapse: {
		position: 'absolute',
		left: 24,
		right: 24,
		bottom: Platform.OS === 'ios' ? 200 : 230,
		height: 50,
		borderColor: '#000',
		backgroundColor: "#000",
		padding: 5,
		borderRadius: 5,
		borderBottomWidth: 0
	},
	cartItem: {
		flex: 1,
		margin: 4,
		width: 70,
		height: 100
	},
	cartItemImage: {
		width: '100%',
		height: 70,
		borderWidth: 0.5,
		borderColor: 'gray',
		resizeMode: 'contain',
	},
	sizeText: {
		position: 'absolute',
		top: 0,
		right: 3,
		fontSize: 12
	},
	quantityText: {
		fontSize: 12
	},
	quantityWrapper: {
		position: 'absolute',
		top: 2,
		left: 2,
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: '#a6a6a6',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	},
	productWrapper: {
		flex: 1,
		flexDirection: 'column',
		marginLeft: 16,
		marginRight: 16,
		marginTop: 8,
		marginBottom: 8,
		justifyContent: 'space-between',
		position: "relative",
		maxWidth: "42%"
	},
	productTitle: {
		textAlign: 'left',
		width: '100%',
		fontSize: 12,
		fontWeight: 'normal',
		marginTop: 8,
		backgroundColor: '#ffffff90',
		lineHeight: 12
	},
	productPrice: {
		marginTop: 3 ,
		textAlign: 'left',
		width: '100%',
		fontSize: 12,
		color: '#000',
		backgroundColor: '#ffffff90',
	},
	checkoutButtonWrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		color: '#fff',
		alignItems: 'center',
		backgroundColor: '#000',
		height: 40,
	},
	cartItemWrapper: {
		paddingLeft: 10, 
		paddingRight: 10, 
		paddingTop: 0,
		backgroundColor: '#FFF',
		borderTopColor: "#000",
		borderTopWidth: 5,
		height: "100%"
	},
	cartButtonWrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		color: '#fff',
		alignItems: 'center',
		backgroundColor: '#000',
		height: 40,
		minWidth: "100%",
		borderRadius: 5
	},
	titleWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff90',
	},
	titleText: {
		color: '#000',
		fontSize: 28,
		marginLeft: 12,
		paddingVertical: 10,
	},
	tapItemText: {
		color: '#000',
		textAlign: 'center',
		marginTop: -1,
		paddingTop: 21,
		fontSize: 12,
		backgroundColor: "#fff"
	},
	overlayWrapper: {
		height: 450,
		width: 330 ,
		maxWidth: '90%',
		maxHeight: '90%',
		flexGrow: 0,
		paddingTop: 15,
		paddingBottom: 15
	},
	closeButton: {
		position: 'absolute',
		right: 10,
		top: 10,
		zIndex: 10
	},
	tab_pane_1: {
		borderWidth: 1, 
		borderColor: "#ddd", 
		borderRadius: 5,					
		height: 30, 
		flex: 1,
		justifyContent: 'center',
		alignItems: "center",
		marginHorizontal: 10,
	},
	tab_pane_1_selected : {
		marginLeft: 5,
		borderWidth: 2, 
		borderColor: "#999", 
		borderRadius: 15,
		paddingLeft:5,
		fontWeight: "bold",
		height: 30, 
		color: "#000",
		flex: 1,
		justifyContent: 'center',
		alignItems: "center",
		textAlign: "center"
	},
	tab_pane_2 : {
		borderWidth: 1, 
		borderColor: "#ddd", 
		borderRadius: 5,					
		height: 30, 
		flex: 1,
		justifyContent: 'center',
		alignItems: "center",
	},
	tab_pane_2_selected : {
		borderWidth: 2, 
		borderColor: "#000", 
		borderRadius: 5,					
		height: 30, 
		fontWeight: "bold",
		color: "#000",
		flex: 1,
		justifyContent: 'center',
		alignItems: "center",
	},
	dropdown: {
		margin: 16,
		height: 50,
		width: "100%",
		paddingTop: 5,
		paddingBottom: 5
	},
	icon: {
		marginRight: 5,
	},
	placeholderStyle: {
		fontSize: 16,
	},
	selectedTextStyle: {
		fontSize: 16,
		color: "#333",
		fontWeight: "bold",
		textAlign: "center"
	},
	iconStyle: {
		width: 20,
		height: 20,
	},
	inputSearchStyle: {
		height: 40,
		fontSize: 16,
	}
});
