import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {IDENTITY_BASE_URL} from '../utilities/ServiceUrl';

let sub_, name_, access, refresh, accestok, refreshtok;

export default class Islemler extends Component {
  state = {
    accessToken: '',
    refreshToken: '',
  };

  _storeData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  };
  _retrieveToken = async () => {
    try {
      const tempt_a = await AsyncStorage.getItem('ACCESS_TOKEN');
      access = JSON.parse(tempt_a);
      const tempt_r = await AsyncStorage.getItem('REFRESH_TOKEN');
      refresh = JSON.parse(tempt_r);
    } catch (error) {
      console.log('hata');
    }
  };

  _getApiInfo = async () => {
    await this._retrieveToken();

    let success = 0;
    new Promise(function(resolve, reject) {
      var timeout = setTimeout(function() {
        reject(new Error('Request timed out'));
      }, 10000);

      fetch(IDENTITY_BASE_URL + '/getuserinfo', {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: access,
        }),
      })
        .then(function(response) {
          clearTimeout(timeout);
          if (response && response.status === 200) {
            console.log('status :', response.status);
            let temp = response.json();
            temp
              .then(tokenx => ({
                _sub: tokenx.sub,
                _name: tokenx.name,
                status: response.status,
              }))
              .then(idJson => {
                success = idJson;
                resolve();
                console.log('sub :', idJson._sub);
                console.log('name:', idJson._name);
                sub_ = idJson._sub;
                name_ = idJson._name;
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
          // this._storeData('SUB_NAME', sub_);
          // this._storeData('USER_NAME', name_);
          console.log('kayit başarılı');
        }
      });
  };

  _rerfreshToken = async () => {
    await this._retrieveToken();
    let success = 0;
    new Promise(function(resolve, reject) {
      var timeout = setTimeout(function() {
        reject(new Error('Request timed out'));
      }, 10000);

      fetch(IDENTITY_BASE_URL + '/refreshtoken', {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refresh,
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
          reject("rerfreshToken1", err);
        });
    })
      .then(function() {})
      .catch(function(err) {
        console.log("rerfreshToken2", err);
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
        }
      });
  };

  render() {
    return (
      <View>
        <Button title="GetUserInfo" onPress={this._getApiInfo} />
        <Button title="RefreshTest" onPress={this._rerfreshToken} />

        <Text>-----Sub Name-------</Text>
        <Text>----- > {sub_}</Text>

        <Text>-----User Name-------</Text>
        <Text>----- > {name_}</Text>
      </View>
    );
  }
}
