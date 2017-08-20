import React from 'react';
import {FontIcon, IconButton} from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import styled from 'emotion/react';
import {Row, Text, palette} from './styleguide';

const StickyHeader = styled(Row)`
  top: 139px;
  margin-left: -40px;
  z-index: 200;
  position: -webkit-sticky;
  position: sticky;
  user-select: none;
`;

const Header = ({minimized, onMinimize, title, muiTheme}) => {
  function renderIcon(minimized) {
    return !minimized
      ? <FontIcon className="material-icons" color={palette.stroke}>indeterminate_check_box</FontIcon>
      : <FontIcon className="material-icons" color={palette.stroke}>add_box</FontIcon>;
  }

  const HeaderRow = styled(Row)`
    padding: 8px;
    border-radius: 4px;
    transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
    border: 1px solid ${muiTheme.palette.borderColor};
    background-color: ${muiTheme.palette.canvasColor};
  `;

  return (
    <StickyHeader justify='start'>
      <IconButton onTouchTap={onMinimize}>
        {renderIcon(minimized)}
      </IconButton>
      <HeaderRow grow justify='space-between'>
        <Text uppercase>
          {title}
        </Text>
      </HeaderRow>
    </StickyHeader>
  );
}

export default muiThemeable()(Header);
