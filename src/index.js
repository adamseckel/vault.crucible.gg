import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import { FirebaseService } from './services';
import { manifestVersion } from './manifestVersion';

const database = firebase
  .initializeApp({
    apiKey: 'AIzaSyDJo3DWxyZXBaCDDmYGZewRro-l4QKy9UI',
    authDomain: 'cruciblegg.firebaseapp.com',
    databaseURL: 'https://cruciblegg.firebaseio.com',
    storageBucket: 'cruciblegg.appspot.com',
  })
  .database();

const apiKey = {
  client_id: process.env.REACT_APP_CLIENT_ID || '13756',
  key: process.env.REACT_APP_APIKEY || '43e0503b64df4ebc98f1c986e73d92ac',
  client_secret:
    process.env.REACT_APP_CLIENT_SECRET || 'm7aOvxvaLgAfeLkT4QC6mg1fyl81iZBt5ptzkq4Pay0',
};

ReactDOM.render(
  <App
    {...{
      apiKey,
      manifestVersion,
      firebaseService: FirebaseService(database.ref(process.env.NODE_ENV || 'development')),
    }}
  />,
  document.getElementById('root'),
);
registerServiceWorker();
