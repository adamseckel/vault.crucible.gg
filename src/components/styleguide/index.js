import {fade} from 'material-ui/utils/colorManipulator';
import {Row, Column} from './Box';
import Text from './Text';
const palette = {
  background: '#FFFFFF',
  stroke: '#EAEAEA',
  darkText: '#000000',
  secondaryText: '#646464',
  vault: '#3A3A3A',
  lightText: '#FFFFFF',
  highlight: '#FFCE1F',
  shadow: '#000000',
  lightLevel: '#F5DC56',
  snack: '#303030'
};

const variables = {
  borderRadius: '4px'
};

const z = {
  z0: 'rgba(0, 0, 0, 0) 0px 3px 10px, rgba(0, 0, 0, 0) 0px 3px 10px',
  z2: 'rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px'
};

const muiThemeDeclaration = {
  palette: {
    primary1Color: '#FFF',
    primary2Color: '#646464',
    primary3Color: '#3A3A3A',
    accent1Color: '#F5DC56',
    textColor: '#000',
    alternateTextColor: '#FFF',
    canvasColor: '#FFF',
    borderColor: '#EAEAEA',
    disabledColor: fade('#000', 0.3),
    pickerHeaderColor: 'red',
    clockCircleColor: fade('#000', 0.07),
    shadowColor: '#000'
  },
  borderRadius: '4px',
  fontFamily: 'Gill Sans, sans-serif'
};

export {
  Row,
  Column,
  Text,
  palette,
  variables,
  z,
  muiThemeDeclaration
};
