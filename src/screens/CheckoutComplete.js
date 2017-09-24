import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  ScrollView,
  Image,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import actions.
import * as ordersActions from '../actions/ordersActions';

// Components
import FormBlock from '../components/FormBlock';
import FormBlockField from '../components/FormBlockField';
import Spinner from '../components/Spinner';

import { stripTags, formatPrice } from '../utils';
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 14,
  },
  mainHeader: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: '0.8rem',
    color: '#7C7C7C',
    marginBottom: 24,
  },
  header: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },
  date: {
    fontSize: '0.7rem',
    color: '#7C7C7C',
  },
  flexWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productsWrapper: {
    marginTop: 30,
  },
  productItem: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  productItemImage: {
    width: 100,
    height: 100,
  },
  productItemDetail: {
    marginLeft: 14,
    width: '70%',
  },
  productItemName: {
    fontSize: '0.9rem',
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  productItemPrice: {
    fontSize: '0.7rem',
    color: 'black',
  },
});

class CheckoutComplete extends Component {
  static propTypes = {
    ordersActions: PropTypes.shape({
      fetchOne: PropTypes.func,
    }),
    orderId: PropTypes.number,
    orderDetail: PropTypes.shape({
      fetching: PropTypes.bool,
    }),
    navigator: PropTypes.shape({
      push: PropTypes.func,
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  static navigatorStyle = {
    navBarBackgroundColor: '#FAFAFA',
    navBarButtonColor: '#989898',
  };

  constructor(props) {
    super(props);

    this.state = {
      fetching: true,
    };

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.props.ordersActions.fetchOne(this.props.orderId);
    this.props.navigator.setTitle({
      title: i18n.gettext('Checkout complete').toUpperCase(),
    });
    this.props.navigator.setButtons({
      leftButtons: [
        {
          id: 'close',
          icon: require('../assets/icons/times.png'),
        },
      ],
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.orderDetail.fetching) {
      this.setState({
        fetching: false,
      });
    }
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  renderProduct = (item) => {
    let productImage = null;
    if ('http_image_path' in item.main_pair.detailed) {
      productImage = (<Image
        source={{ uri: item.main_pair.detailed.http_image_path }}
        style={styles.productItemImage}
      />);
    }
    return (
      <View style={styles.productItem}>
        {productImage}
        <View style={styles.productItemDetail}>
          <Text
            style={styles.productItemName}
            numberOfLines={1}
          >
            {item.product}
          </Text>
          <Text style={styles.productItemPrice}>
            {item.amount} x ${item.price}
          </Text>
        </View>
      </View>
    );
  }

  render() {
    const { orderDetail } = this.props;
    if (this.state.fetching) {
      return (
        <View style={styles.container}>
          <Spinner visible mode="content" />
        </View>
      );
    }

    const productsList = orderDetail.product_groups.map((group) => {
      const products = Object.keys(group.products).map(k => group.products[k]);
      return products.map(p => this.renderProduct(p));
    });

    const date = new Date(orderDetail.timestamp * 1000);
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.mainHeader}>
            {i18n.gettext('Congratulations!')}
          </Text>
          <Text style={styles.subHeader}>
            {i18n.gettext('Your order has been successfully placed.')}
          </Text>
          <FormBlock>
            <View style={styles.flexWrap}>
              <Text style={styles.header}>
                {i18n.gettext('order').toUpperCase()} #{orderDetail.order_id}
              </Text>
              <Text style={styles.date}>
                {`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`}
              </Text>
            </View>

            <View style={styles.productsContainer}>
              <Text style={styles.header}>
                {i18n.gettext('Products information').toUpperCase()}
              </Text>
              <View style={styles.productsWrapper}>
                {productsList}
              </View>
            </View>
          </FormBlock>

          <FormBlock
            title={i18n.gettext('Billing address')}
            buttonText={i18n.gettext('Show all').toUpperCase()}
            simpleView={
              <View>
                <FormBlockField title={i18n.gettext('First name:')}>
                  {orderDetail.s_firstname}
                </FormBlockField>
                <FormBlockField title={i18n.gettext('Last name:')}>
                  {orderDetail.s_lastname}
                </FormBlockField>
              </View>
            }
          >
            <View>
              <FormBlockField title={i18n.gettext('First name:')}>
                {orderDetail.b_firstname}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Last name:')}>
                {orderDetail.b_lastname}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('E-mail:')}>
                {orderDetail.email}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Phone:')}>
                {orderDetail.phone}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Address:')}>
                {orderDetail.b_address} {orderDetail.b_address2}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('City:')}>
                {orderDetail.b_city}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Country:')}>
                {orderDetail.b_country}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('State:')}>
                {orderDetail.b_state}
              </FormBlockField>
            </View>
          </FormBlock>

          <FormBlock
            title={i18n.gettext('Shipping address')}
            buttonText={i18n.gettext('Show all').toUpperCase()}
            simpleView={
              <View>
                <FormBlockField title={i18n.gettext('First name:')}>
                  {orderDetail.s_firstname}
                </FormBlockField>
                <FormBlockField title={i18n.gettext('Last name:')}>
                  {orderDetail.s_lastname}
                </FormBlockField>
              </View>
            }
          >
            <View>
              <FormBlockField title={i18n.gettext('First name:')}>
                {orderDetail.s_firstname}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Last name:')}>
                {orderDetail.s_lastname}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('E-mail:')}>
                {orderDetail.email}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Phone:')}>
                {orderDetail.phone}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Address:')}>
                {orderDetail.s_address} {orderDetail.s_address2}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('City:')}>
                {orderDetail.s_city}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('Country:')}>
                {orderDetail.s_country}
              </FormBlockField>
              <FormBlockField title={i18n.gettext('State:')}>
                {orderDetail.s_state}
              </FormBlockField>
            </View>
          </FormBlock>
        </ScrollView>
      </View>
    );
  }
}

export default connect(state => ({
  cart: state.cart,
  auth: state.auth,
  orderDetail: state.orderDetail,
}),
dispatch => ({
  ordersActions: bindActionCreators(ordersActions, dispatch),
})
)(CheckoutComplete);