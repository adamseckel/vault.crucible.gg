import React from 'react';
import {palette, z, Row} from './styleguide';
import styled from 'emotion/react';
import {Motion, spring} from 'react-motion';
import {AppBar, FlatButton, FontIcon, IconButton} from 'material-ui';
import UserMenu from './UserMenu';
import SearchBar from './SearchBar';
import muiThemeable from 'material-ui/styles/muiThemeable';

const SignInButton = styled(FlatButton)`
  span {
    font-size: 16px !important;
  }
`;

const ReloadIcon = styled(FontIcon)`
  transition: all .3s linear;
`;

const Bar = ({authorized, onReload, onAuthorize, onLogout, onToggleTheme, onSearchForItem, className, style, muiTheme}) => {
  const TopBar = styled(AppBar)`
    border-bottom: 1px solid ${muiTheme.palette.borderColor} !important;
    padding-left: 50px !important;
    position: fixed !important;
    top: 0 !important;
  `;

  return (
    <TopBar
      {...{style, className}}
      title='VAULT'
      zDepth={0}
      showMenuIconButton={false}
      titleStyle={{
        color: palette.secondaryText,
        textAlign: 'left'
      }}>
      <SearchBar onChange={onSearchForItem}/>
      <Row justify='end' css={`marginRight: 28px;`}>
        {authorized
          ? <Row justify='end' css={`margin-right: -15px`}>
              <IconButton onTouchTap={onReload}>
                <ReloadIcon color={palette.secondaryText} className='material-icons'>refresh</ReloadIcon>
              </IconButton>
              <UserMenu {...{onLogout, onToggleTheme}}/>
            </Row>
          : <SignInButton label='Sign In' onTouchTap={onAuthorize}/>
        }
      </Row>
    </TopBar>
  )
};

export default muiThemeable()(Bar);