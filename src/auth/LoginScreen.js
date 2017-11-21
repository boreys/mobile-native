import React, {
  Component
} from 'react';

import { NavigationActions } from 'react-navigation';

import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';

import LoginForm from './LoginForm';

export default class LoginScreen extends Component {

  render() {
    return (
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.title}>
          Login to Minds
        </Text>
        <KeyboardAvoidingView
          behavior='padding'
          style={styles.container}
        >
          <LoginForm
            onLogin={() => this.login()}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }

  login() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Tabs' })
      ]
    })

    this.props.navigation.dispatch(resetAction);
  }
}

const styles = StyleSheet.create({

});