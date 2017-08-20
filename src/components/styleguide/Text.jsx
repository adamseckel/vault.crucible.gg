import styled from 'emotion/react';
import {palette} from './index';

const sizes = {
  1: '1rem',
  0: '.8rem'
}

export default styled.p `
  margin: 0;
  font-family: Gill Sans, sans-serif;
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
        : palette.darkText};
  font-weight: ${props => props.bold
        ? 500
        : props.light
          ? 200
          : 400};
  transition: color .3s ease;
`;