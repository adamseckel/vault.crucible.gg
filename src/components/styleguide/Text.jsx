import styled from 'emotion/react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {palette, font} from './styleguide';

const sizes = {
  1: '1rem',
  0: '.8rem'
};

const Text = styled.p `
  margin: 0;
  font-family: ${font.fontFamily};
  text-transform: ${props => props.uppercase
  ? 'uppercase'
  : 'none'};
  font-size: ${props => sizes[props.size] || sizes[1]};
  color: ${props => props.white
    ? palette.lightText
    : props.lightLevel
      ? palette.lightLevel
      : props.gray 
        ? palette.secondaryText
        : props.muiTheme.palette.textColor};
  font-weight: ${props => props.bold
        ? 500
        : props.light
          ? 200
          : 400};
  transition: color .3s ease;
`;

export default muiThemeable()(Text);