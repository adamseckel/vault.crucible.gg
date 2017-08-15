import React from 'react';
import styled from 'emotion/react';
import {palette} from './styleguide';

const GridCell = styled.div `
  min-width: 250px;
  max-width: ${props => props.vault
  ? 'none'
  : '250px'};
  padding: 10px;
  user-select: none;
  border-right: ${props => props.vault
    ? 0
    : `1px solid ${palette.stroke}`};
  flex-grow: ${props => props.vault
      ? 2
      : 0};
  width: 100%;
`;

export default({vault, children}) => {
  return (
    <GridCell vault={vault}>
      {children}
    </GridCell>
  );
};
