import { fade } from 'material-ui/utils/colorManipulator';
import { Row, Column } from './Box';
import Text from './Text';
import Divider from './Divider';
import animations from './animations';

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
  snack: fade('#000000', 0.9),
  legendary: '#522f65',
  exotic: '#ceae33',
  rare: '#5076a3',
  common: '#c3bcb4',
  uncommon: '#366f42',
  twitterBlue: '#1da1f2',
};

const variables = {
  borderRadius: '4px',
};

const z = {
  z0: 'rgba(0, 0, 0, 0) 0px 3px 10px, rgba(0, 0, 0, 0) 0px 3px 10px',
  z1: 'rgba(0, 0, 0, 0.16) 0px 3px 10px, rgba(0, 0, 0, 0.23) 0px 3px 10px',
  z2: 'rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px',
};

const muiThemeDeclaration = {
  palette: {
    primary1Color: '#FFF',
    primary2Color: '#646464',
    primary3Color: '#3A3A3A',
    accent1Color: palette.twitterBlue,
    textColor: '#000',
    alternateTextColor: '#FFF',
    canvasColor: '#FFF',
    borderColor: '#EAEAEA',
    disabledColor: fade('#000', 0.3),
    pickerHeaderColor: 'red',
    clockCircleColor: fade('#000', 0.07),
    shadowColor: '#000',
  },
  borderRadius: '4px',
  fontFamily: 'Gill Sans, sans-serif',
};

export { Row, Column, Text, Divider, palette, variables, animations, z, muiThemeDeclaration };
