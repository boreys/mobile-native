import './global';
import './shim'
import crypto from "crypto"; // DO NOT REMOVE!

import React, {
  Component
} from 'react';

import {
  Observer,
  Provider,
} from 'mobx-react/native'  // import from mobx-react/native instead of mobx-react fix test

import {
  addNavigationHelpers,
  NavigationActions
} from 'react-navigation';

import {
  BackHandler,
  Platform,
  Linking,
  Text,
} from 'react-native';

import KeychainModalScreen from './src/keychain/KeychainModalScreen';
import BlockchainTransactionModalScreen from './src/blockchain/transaction-modal/BlockchainTransactionModalScreen';
import NavigatorStore from './src/common/stores/NavigationStore';
import NavigationStoreService from './src/common/services/navigation.service';
import Stack from './AppScreens';
import stores from './AppStores';
import './AppErrors';
import './src/common/services/socket.service';
import pushService from './src/common/services/push.service';
import sessionService from './src/common/services/session.service';
import deeplinkService from './src/common/services/deeplinks-router.service';

// build navigation store
stores.navigatorStore = new NavigatorStore(Stack);

// Setup navigation store proxy (to avoid circular references issues)
NavigationStoreService.set(stores.navigatorStore);

// init push service
pushService.init();
// register device token into backend on login
sessionService.onLogin(() => {
  pushService.registerToken();
})

// disable yellow boxes
//console.disableYellowBox = true;

/**
 * App
 */
export default class App extends Component {

  /**
   * On component will mount
   */
  componentWillMount() {
    Text.defaultProps.style = {
      fontFamily: 'Roboto',
      color: '#444',
    };
  }

  /**
   * Go to screen
   * @param {string} screen 
   */
  goTo(screen) {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: screen })
      ]
    })
    stores.navigatorStore.dispatch(resetAction);
  }

  /**
   * On component did mount
   */
  async componentDidMount() {
    const token = await sessionService.init();

    if (token) {
      try {
        const result = await stores.user.load();
        // go to main screen.
        this.goTo('Tabs');
        // handle initial notifications (if the app is opened by tap on one)
        pushService.handleInitialNotification();
        // handle deep link (if the app is opened by one)
        Linking.getInitialURL().then(url => url && this.handleOpenURL(url));
      } catch(err) {
        console.log(err)
        alert('Error logging in');
        this.goTo('Login');
      };
    } else {
      this.goTo('Login');
    }

    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    Linking.addEventListener('url', event => this.handleOpenURL(event.url));
  }

  /**
   * On component will unmount
   */
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  /**
   * Handle hardware back button
   */
  onBackPress = () => {
    const { dispatch } = this.props;
    if (stores.navigatorStore.navigationState.index === 0) {
      return false;
    }
    stores.navigatorStore.dispatch(NavigationActions.back());
    return true;
  };

  /**
   * Handle deeplink urls
   */
  handleOpenURL = (url) => {
    setTimeout(() => {
      deeplinkService.navigate(url);
    }, 100);
  }

  /**
   * Render
   */
  render() {
    const app = (
      <Provider key="app" {...stores}>
        <Observer>{
        () => <Stack navigation={addNavigationHelpers({
          dispatch: stores.navigatorStore.dispatch,
          state: stores.navigatorStore.navigationState,
          addListener: () => { }
        })}/>
      }</Observer>
      </Provider>
    );

    const keychainModal = (
      <KeychainModalScreen key="keychainModal" keychain={ stores.keychain } />
    );

    const blockchainTransactionModal = (
      <BlockchainTransactionModalScreen key="blockchainTransactionModal" blockchainTransaction={ stores.blockchainTransaction } />
    );

    return [ app, keychainModal, blockchainTransactionModal ];
  }
}
