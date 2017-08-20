import {fade} from 'material-ui/utils/colorManipulator';

export const palette = {
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

export const darkPalette = {
  accent1Color: "#ff4081",
  accent2Color: "#f50057",
  accent3Color: "#ff80ab",
  alternateTextColor: "#FFF",
  borderColor: "rgba(255, 255, 255, 0.08)",
  canvasColor: "#303030",
  clockCircleColor: "rgba(255, 255, 255, 0.12)",
  disabledColor: "rgba(255, 255, 255, 0.3)",
  pickerHeaderColor: "rgba(255, 255, 255, 0.12)",
  primary1Color: "#303030",
  primary2Color: "#303030",
  primary3Color: "#757575",
  secondaryTextColor: "rgba(255, 255, 255, 0.7)",
  textColor: "rgba(255, 255, 255, 1)"
};

export const variables = {
  borderRadius: '4px'
};

export const font = {
  fontFamily: 'Helvetica Neue, Gill Sans, Gill Sans Nova, Segoe UI, sans-serif',
};

export const z = {
  z0: 'rgba(0, 0, 0, 0) 0px 3px 10px, rgba(0, 0, 0, 0) 0px 3px 10px',
  z2: 'rgba(0, 0, 0, 0.156863) 0px 3px 10px, rgba(0, 0, 0, 0.227451) 0px 3px 10px'
};

export const muiThemeDeclaration = {
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
  fontFamily: font.fontFamily
};