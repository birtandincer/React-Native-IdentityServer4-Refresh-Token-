/* eslint-disable handle-callback-err */
/* eslint-disable eqeqeq */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';

import packageJson from '../../package.json';

import ButtonEnter from '../components/buttons/loginButons/buttonEnter';


import AsyncStorage from '@react-native-community/async-storage';

import {BASE_URL, IDENTITY_BASE_URL} from '../utilities/ServiceUrl';
import {USERNAME} from '../utilities/DbTags';

const FETCH_TIMEOUT = 10000;
let accestok, refreshtok;
class LoginScren extends Component {
  state = {
    userName: 'xxx',
    passWord: 'xxx',
    selectedUserName: true,
    selectedPassword: true,
    spinner: false,
    accesToken: '',
    refreshToken: '',
  };

  
  _signIn = () => {
    let success = 0;
    new Promise(function(resolve, reject) {
      var timeout = setTimeout(function() {
        reject(new Error('Request timed out'));
      }, 10000);

      fetch(IDENTITY_BASE_URL + '/signin', {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: 'xx',
          Password: 'xx',
        }),
      })
        .then(function(response) {
          clearTimeout(timeout);
          if (response && response.status === 200) {
            console.log('status :', response.status);
            let temp = response.json();
            temp
              .then(token => ({
                acces_tokenim: token.access_token,
                refresh_tokenim: token.refresh_token,
                status: response.status,
              }))
              .then(idJson => {
                success = idJson;
                resolve();
                console.log('accestoken:', idJson.acces_tokenim);
                console.log('refreshtoken:', idJson.refresh_tokenim);
                accestok = idJson.acces_tokenim;
                refreshtok = idJson.refresh_tokenim;
              });
          } else {
            reject(new Error('Response error'));
          }
        })
        .catch(function(err) {
          reject(err);
        });
    })
      .then(function() {})
      .catch(function(err) {
        console.log(err);
        success = -1;
      })
      .finally(f => {
        this.setState({spinner: false});

        if (success === 0) {
          this.showErrorAlert('hata var ');
        } else if (success === -1) {
          Alert.alert('Servis Yanıt Vermiyor. ');
        } else if (success) {
          this._storeData('ACCESS_TOKEN', accestok);
          this._storeData('REFRESH_TOKEN', refreshtok);
          this.props.navigation.navigate('Islemler');
        }
      });
  };

  onIslemlerScreen = () => {
    if (this.state.userName === null) {
      alert('Kullanıcı adı girmediniz');
    }
    if (this.state.passWord === null) {
      alert('şifre girmediniz');
    } else {
      this.keyboardDidHideListener.remove();
      this.setState({spinner: true});
      this.checkConnection();
      this._signIn();
      Keyboard.dismiss();
    }
  };

  _storeData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  };

  

  onFocusUserName = () => {
    this.setState({
      selectedUserName: true,
    });
  };

  onBlurUserName = () => {
    this.setState({
      selectedUserName: false,
    });
  };

  onFocusPassword = () => {
    this.setState({
      selectedPassword: true,
    });
  };

  onBlurPassword = () => {
    this.setState({
      selectedPassword: false,
    });
  };

  _keyboardDidHide = () => {
    this.setState({
      selectedUserName: false,
      selectedPassword: false,
    });
  };



  render() {
    return (
      <View>
        <View style={styles.logoContiner}>
          <Image style={styles.logo} source={require('../images/e-saha.png')} />
        </View>
        <View style={styles.container}>
          <View style={styles.userNameContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Kullanıcı Adı"
              keyboardType="email-address"
              onChangeText={userName => this.setState({userName})}
              value={this.state.userName}
            />
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Şifre"
              secureTextEntry={true}
              onChangeText={passWord => this.setState({passWord})}
              value={this.state.passWord}
            />
          </View>

          {this.state.spinner ? (
            <ActivityIndicator size="large" color="#014a01" />
          ) : null}
          <ButtonEnter onPress={this.onIslemlerScreen} />

       
        </View>
      </View>
    );
  }
}

export default LoginScren;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    paddingTop: 50,
  },
  logo: {
    alignItems: 'center',
    height: 60,
    resizeMode: 'contain',
  },
  version: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: 30,
    alignItems: 'flex-end',
  },
  logoContiner: {
    alignItems: 'center',
    height: 70,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  welcome: {
    fontSize: 25,
    color: '#5B5A5A',
    letterSpacing: 6,
  },
  textInput: {
    color: '#989899',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 17,
  },
  userNameContainer: {
    width: 375,
    borderColor: '#CFD0D1',
    borderWidth: 1,
    height: 60,
    padding: 10,
    borderBottomWidth: 0,
    backgroundColor: '#F5F6F7',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  passwordContainer: {
    width: 375,
    borderColor: '#CFD0D1',
    borderWidth: 1,
    height: 60,
    padding: 10,
    marginTop: 23,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#F5F6F7',
  },
});
