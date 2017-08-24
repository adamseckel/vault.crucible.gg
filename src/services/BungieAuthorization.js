import axios from 'axios';
import store from './localStoreService'

export default function (apiKey) {
  return store
    .get('Vault::Authorization')
    .then((localStorageAuth) => {
      if (window.location.href.includes('authorize')) {
        const authCode = new URLSearchParams(window.location.search).get("code");
        return getAuthorization(apiKey, authCode, 'authorization_code').then((authorization) => {
          return store.set('Vault::Authorization', authorization);
        });
      } else if (localStorageAuth && localStorageAuth.authorizationExpiresAt < Date.now()) {
        return getAuthorization(apiKey, localStorageAuth.refresh_token, 'refresh_token').then((authorization) => {
          return store.set('Vault::Authorization', authorization);
        });
      } else if (localStorageAuth && localStorageAuth.authorizationExpiresAt > Date.now()) {
        return Promise.resolve(localStorageAuth);
      } else {
        throw new Error('NOPE')
      }
    });
}

function getAuthorization(apiKey, token, grantType) {
  return axios
    .post('https://www.bungie.net/platform/app/oauth/token/', `&client_id=${apiKey.client_id}&client_secret=${apiKey.client_secret}&${grantType === 'refresh_token'
    ? 'refresh_token'
    : 'code'}=${token}&grant_type=${grantType}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then((response) => {
      if (response.data.access_token) {
        return Object.assign(response.data, {
          authorizationExpiresAt: Date.now() + (response.data.expires_in * 1000),
          refreshExpiresAt: Date.now() + (response.data.refresh_expires_in * 1000)
        });
      } else {
        return new Error('Could Not Get Access Tokens')
      }
    });
}
