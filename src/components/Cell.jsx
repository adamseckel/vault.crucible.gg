import React from 'react';
import styled from 'emotion/react';
import {palette} from './styleguide';
import muiThemeable from 'material-ui/styles/muiThemeable';

const Cell = ({vault, children, muiTheme}) => {

  const GridCell = styled.div `
    min-width: 250px;
    max-width: ${props => props.vault
    ? 'none'
    : '250px'};
    padding: 10px;
    user-select: none;
    border-right: ${props => props.vault
      ? 0
      : `1px solid ${muiTheme.palette.borderColor}`};
    flex-grow: ${props => props.vault
        ? 2
        : 0};
    width: 100%;
  `;

  return (
    <GridCell vault={vault}>
      {children}
    </GridCell>
  );
};

export default muiThemeable()(Cell);
