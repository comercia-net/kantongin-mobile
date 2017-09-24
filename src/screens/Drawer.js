import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Text,
  View,
  Image,
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import uniqueId from 'lodash/uniqueId';
import i18n from '../utils/i18n';

import config from '../config';
import * as authActions from '../actions/authActions';
import * as pagesActions from '../actions/pagesActions';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$drawerBgColor',
    paddingTop: 30,
  },
  logo: {
    height: 30,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  signInBtn: {
    backgroundColor: '#47C9AF',
    padding: 12,
  },
  signInBtnText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: '0.9rem',
  },
  itemBtn: {
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderColor: '#F2F2F2',
  },
  itemBtnText: {
    fontSize: '0.9rem',
  },
  group: {
    marginTop: 40,
  },
  itemBadgeRed: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FD542A'
  },
  itemBadgeRedText: {
    color: '#fff',
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  itemBadgeGray: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray'
  },
  itemBadgeGrayText: {
    color: 'black',
  },
  signOutBtn: {
    backgroundColor: 'gray',
  },
});

class Drawer extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      resetTo: PropTypes.func,
      showModal: PropTypes.func,
      toggleDrawer: PropTypes.func,
      dismissModal: PropTypes.func,
      showInAppNotification: PropTypes.func,
    }),
    cart: PropTypes.shape({
      amount: PropTypes.number,
    }),
    pages: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    auth: PropTypes.shape({
      logged: PropTypes.bool,
    }),
    authActions: PropTypes.shape({
      logout: PropTypes.func,
    }),
    pagesActions: PropTypes.shape({
      fetch: PropTypes.func,
    }),
  };

  componentDidMount() {
    this.props.pagesActions.fetch();
  }

  handleOpenPage = (page) => {
    const url = `${config.siteUrl}index.php?dispatch=pages.view&page_id=${page.page_id}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open URI: ${url}`);
      }
    });
  }

  renderLogo = () => (
    <Image
      source={{ uri: config.logoUrl }}
      style={styles.logo}
    />
  );

  renderSearchBar = () => (
    <View style={styles.search} />
  );

  renderSignInBtn = () => {
    if (this.props.auth.logged) {
      return (
        <TouchableOpacity
          style={[styles.signInBtn, styles.signOutBtn]}
          onPress={() => {
            this.props.navigator.toggleDrawer({});
            this.props.authActions.logout();
          }}
        >
          <Text style={styles.signInBtnText}>
            {i18n.gettext('Logout')}
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.signInBtn}
        onPress={() => {
          this.props.navigator.toggleDrawer({
            side: 'left',
          });
          this.props.navigator.showModal({
            screen: 'Login',
          });
        }}
      >
        <Text style={styles.signInBtnText}>
          {i18n.gettext('Sign in')}
        </Text>
      </TouchableOpacity>
    );
  }

  renderItem = (text, onPress, badge = 0, type = 'red') => {
    const renderBadge = () => {
      if (badge === 0) {
        return null;
      }
      let badgeStyle = styles.itemBadgeRed;
      let badgeTextStyle = styles.itemBadgeRedText;
      if (type === 'gray') {
        badgeStyle = styles.itemBadgeGray;
        badgeTextStyle = styles.itemBadgeGrayText;
      }
      return (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>
            {badge}
          </Text>
        </View>
      );
    };
    return (
      <TouchableOpacity
        style={styles.itemBtn}
        onPress={onPress}
        key={uniqueId()}
      >
        <View>
          <Text style={styles.itemBtnText}>
            {text}
          </Text>
          {renderBadge()}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { navigator, pages } = this.props;
    const pagesList = pages.items
      .map(p => this.renderItem(p.page, () => this.handleOpenPage(p)));
    return (
      <ScrollView style={styles.container}>
        {this.renderLogo()}
        {this.renderSignInBtn()}
        {this.renderSearchBar()}
        <View style={styles.group}>
          {this.renderItem(i18n.gettext('Home'), () => {
            navigator.handleDeepLink({
              link: 'home/',
              payload: {},
            });
            navigator.toggleDrawer({
              side: 'left',
            });
          })}
          {this.renderItem(i18n.gettext('Cart'), () => {
            navigator.showModal({
              screen: 'Cart',
            });
            navigator.toggleDrawer({
              side: 'left',
            });
          }, this.props.cart.amount)}
          {this.renderItem(i18n.gettext('My Profile'), () => {
            navigator.handleDeepLink({
              link: 'profile/',
              payload: {},
            });
            navigator.toggleDrawer({
              side: 'left',
            });
          })}
          {this.renderItem(i18n.gettext('Orders'), () => {
            navigator.handleDeepLink({
              link: 'orders/',
              payload: {},
            });
            navigator.toggleDrawer({
              side: 'left',
            });
          })}
        </View>
        <View style={styles.group}>
          {pagesList}
        </View>
      </ScrollView>
    );
  }
}

export default connect(state => ({
  auth: state.auth,
  cart: state.cart,
  pages: state.pages,
}),
dispatch => ({
  authActions: bindActionCreators(authActions, dispatch),
  pagesActions: bindActionCreators(pagesActions, dispatch),
})
)(Drawer);