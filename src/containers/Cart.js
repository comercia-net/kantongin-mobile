import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Alert,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome';
import Swipeout from 'react-native-swipeout';

// Import actions.
import * as cartActions from '../actions/cartActions';
import * as ordersActions from '../actions/ordersActions';

// Components
import Spinner from '../components/Spinner';

// Styles
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBtn: {
    padding: 10,
  },
  trashIcon: {
    height: 20,
    fontSize: 20,
  },
  productItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    paddingBottom: 10,
    flexDirection: 'row',
    padding: 14,
  },
  productItemImage: {
    width: 100,
    height: 100,
  },
  productItemName: {
    fontSize: '0.9rem',
    color: 'black',
    marginBottom: 5,
  },
  productItemPrice: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: 'black',
  },
  placeOrderBtn: {
    backgroundColor: '#FF6008',
    padding: 14,
  },
  placeOrderBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: '1rem',
  },
  emptyListContainer: {
    marginTop: '3rem',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyListIconWrapper: {
    backgroundColor: '#3FC9F6',
    width: '12rem',
    height: '12rem',
    borderRadius: '6rem',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListIcon: {
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: '6rem',
  },
  emptyListHeader: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'black',
    marginTop: '1rem',
  },
  emptyListDesc: {
    fontSize: '1rem',
    color: '#24282b',
    marginTop: '0.5rem',
  },
});

class Cart extends Component {
  static propTypes = {
    navigation: PropTypes.shape({}),
    ordersActions: PropTypes.shape({}),
    cartActions: PropTypes.shape({
      fetch: PropTypes.func,
      clear: PropTypes.func,
      remove: PropTypes.func,
    }),
    auth: PropTypes.shape({}),
    cart: PropTypes.shape({}),
  };

  static navigationOptions = ({ navigation }) => {
    if (!navigation.state.params) {
      return {};
    }
    let { title, headerRight } = navigation.state.params;
    return {
      title,
      headerRight,
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      refreshing: false,
      products: [],
    };
  }

  componentDidMount() {
    const { navigation, cart } = this.props;
    navigation.setParams({
      title: `CART (${cart.amount})`,
      headerRight: this.renderClearCart(),
    });
  }

  componentWillReceiveProps(nextProps) {
    const { cart, navigation, auth } = nextProps;
    if (cart.fetching) {
      return;
    }
    const products = Object.keys(cart.products).map((key) => {
      const result = cart.products[key];
      result.cartId = key;
      return result;
    });
    this.setState({
      products,
      refreshing: false,
    }, () => {
      const newTitle = `CART (${cart.amount})`;
      if (navigation.state.params.title != newTitle) {
        navigation.setParams({
          title: `CART (${cart.amount})`,
        });
      }
    });
  }

  handleRefresh() {
    const { cartActions, auth } = this.props;
    this.setState(
      { refreshing: true },
      () => cartActions.fetch(auth.token),
    );
  }

  handlePlaceOrder() {
    const { ordersActions, auth } = this.props;
    ordersActions.create(auth.token, {
      user_id: '3',
      payment_id: 2,
      shipping_id: '1',
      products: {
          12: {
            product_id: 12,
            amount: 1
          },
          13: {
            product_id: 13,
            amount: 2
          }
      },
      user_data: {
        email: 'guest@example.com',
        firstname: 'Guest',
        lastname: 'Guest',
        s_firstname: 'Guest',
        s_lastname: 'Guest',
        s_country: 'US',
        s_city: 'Boston',
        s_state: 'MA',
        s_zipcode: '02125',
        s_address: '44 Main street',
        b_firstname: 'Guest',
        b_lastname: 'Guest',
        b_country: 'US',
        b_city: 'Boston',
        b_state: 'MA',
        b_zipcode: '02125',
        b_address: '44 Main street'
      }
    });
  }

  renderClearCart = () => (
    <TouchableOpacity
      style={styles.topBtn}
      onPress={() => {
        Alert.alert(
          'Clear all cart ?',
          '',
          [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel'
            },
            {
              text: 'OK',
              onPress: () => this.props.cartActions.clear(),
            },
          ],
          { cancelable: true }
        );
      }}
    >
      <Icon name="trash" style={styles.trashIcon} />
    </TouchableOpacity>
  );

  handleRemoveProduct = (product) => {
    const { cartActions, auth } = this.props;
    cartActions.remove(auth.token, product.cartId);
  };

  renderProductItem = (item) => {
    let productImage = null;
    if ('http_image_path' in item.main_pair.detailed) {
      productImage = (<Image
        source={{ uri: item.main_pair.detailed.http_image_path }}
        style={styles.productItemImage}
      />);
    }

    const swipeoutBtns = [
      {
        text: 'Delete',
        type: 'delete',
        onPress: () => this.handleRemoveProduct(item),
      },
    ];

    return (
      <Swipeout
        autoClose
        right={swipeoutBtns}
        backgroundColor={'#fff'}
      >
        <View style={styles.productItem}>
          {productImage}
          <View style={styles.productItemDetail}>
            <Text style={styles.productItemName}>
              {item.product}
            </Text>
            <Text style={styles.productItemPrice}>
              {item.amount} x ${item.price}
            </Text>
          </View>
        </View>
      </Swipeout>
    );
  }

  renderPlaceOrder() {
    return (
      <View style={styles.placeOrderContainer}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={() => this.handlePlaceOrder()}
        >
          <Text style={styles.placeOrderBtnText}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <View style={styles.emptyListIconWrapper}>
        <Icon name="shopping-cart" style={styles.emptyListIcon} />
      </View>
      <Text style={styles.emptyListHeader}>
        Your shopping cart is empty.
      </Text>
      <Text style={styles.emptyListDesc}>
        Looking for ideas?
      </Text>
    </View>
  );

  renderList() {
    const { products } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => this.renderProductItem(item)}
          onRefresh={() => this.handleRefresh()}
          refreshing={this.state.refreshing}
        />
        {this.renderPlaceOrder()}
      </View>
    );
  }

  renderSpinner = () => {
    const { cart } = this.props;
    if (this.state.refreshing) {
      return false;
    }
    return (
      <Spinner visible={cart.fetching} />
    );
  };

  render() {
    const { products } = this.state;
    return (
      <View style={styles.container}>
        {products.length ? this.renderList() : this.renderEmptyList()}
        {this.renderSpinner()}
      </View>
    );
  }
}

Cart.propTypes = {
  navigation: PropTypes.shape({}),
  cart: PropTypes.shape({}),
};

export default connect(state => ({
  nav: state.nav,
  auth: state.auth,
  cart: state.cart,
}),
  dispatch => ({
    cartActions: bindActionCreators(cartActions, dispatch),
    ordersActions: bindActionCreators(ordersActions, dispatch),
  })
)(Cart);
