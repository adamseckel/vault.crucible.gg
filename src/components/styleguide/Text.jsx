import styled from 'react-emotion';
import {palette} from './index';

const sizes = {
  max: '40rem',
  5: '5rem',
  4: '3rem',
  3: '2rem',
  2: '1.4rem',
  1: '1rem',
  0: '.8rem'
}

export default styled.p `
  margin: 0;
  font-family: Gill Sans, Gill Sans Nova, Segoe UI, sans-serif;
  text-transform: ${props => props.uppercase
  ? 'uppercase'
  : 'none'};
  font-style: ${props => props.italic
    ? 'italic'
    : 'none'};
  text-align: ${props => props.right ? 'right' : props.center ? 'center' : 'left'};
  font-size: ${props => sizes[props.size] || sizes[1]};
  letter-spacing: ${props => props.spacing ? '2px' : props.title ? '10px' : 0};
  color: ${props => props.white
    ? palette.lightText
    : props.lightLevel
      ? palette.lightLevel
      : props.gray
        ? palette.secondaryText
        : palette.darkText};
  font-weight: ${props => props.bold
        ? 500
        : props.light
          ? 200
          : 400};
  transition: color .3s ease;
`;