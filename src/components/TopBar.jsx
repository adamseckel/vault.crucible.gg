import React from 'react';
import {Row, palette} from './styleguide';
import styled from 'emotion/react';
import {SearchBar} from './index';
import AppBar from 'material-ui/AppBar';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

const TopBar = styled(AppBar)`
  border-bottom: 1px solid ${palette.stroke} !important;
  padding-left: 50px !important;
`;

const SearchBarContainer = styled(Row)`
  width: 50%;
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  right: 0;
  margin: 0 auto;
`;

const accountTypeMap = {
  1: 'XBOX',
  2: 'PS4',
  4: 'BNET'
};

const StyledDropdown = styled(DropDownMenu)`
  margin-bottom: 6px;
  margin-right: -30px;
  & div {
    color: ${palette.secondaryText} !important;
  }
`

export default({className, style, searchForItem, authenticated, onReload, query, onLogout, onAuthorize, onFeedback, destinyAccounts, selectedAccount, handleAccountChange, SignInButton}) => {
  function mapAccounts(accounts) {
    return accounts && accounts.map((account) => {
      return <MenuItem key={account.membershipType}
        style={{color: palette.secondaryText}}
        value={account}
        primaryText={accountTypeMap[account.membershipType]} />
    });
  }

  return <TopBar
    title='VAULT'
    zDepth={0}
    className={className}
    style={style}
    showMenuIconButton={false}
    titleStyle={{
      color: palette.secondaryText,
      textAlign: 'left'
    }}>
    <SearchBarContainer>
      {authenticated && <SearchBar onChange={searchForItem} query={query}/>}
      <svg css={`width: 30px; position: absolute; z-index: 1; top: 0; bottom: 0; margin: auto; left: 0; right: 0;`} viewBox="0 0 457.92 506.82"><polyline points="426.79 261.25 448.23 282.69 229.75 501.16 11.27 282.69 32.08 261.88" style={{fill: 'none', stroke: '#000', strokeMiterlimit:10, strokeWidth:'8px'}}/><polygon points="229.63 56.79 429.95 258.1 457.92 230.13 229.63 0 0 230.04 28.78 258.82 229.63 56.79"/><path d="M257.1,74.19,62.66,268.62l193.6,193.65L450.67,267.83Zm73.05,258.06a8.22,8.22,0,0,0-2,8v.11l-.5.12a8.18,8.18,0,0,0-7.68,2l-7.25-7.12,2.74-2.74-18.52-18.51a1.69,1.69,0,0,1-1.48-.5c-1-1-6.89-6.55-10.07-6.18l-9.23,9.23c-.91.91-.5,2.83-.54,4l.11.11-.15.15V321c0,.08-.12.06-.17.1l-3.57,3.58-8.63-8.62,3.9-3.89.19.18c1.17,0,3.36.64,4.28-.27l6.93-6.93-.7-.69,1.5-1.5-22.37-22.37L234.58,303l1.5,1.5-.69.69,6.93,6.93c.89.91,3.1.25,4.28.27l.18-.18,3.9,3.89-8.85,8.62-3.58-3.58a.3.3,0,0,1-.17-.1s0-.06,0-.08l-.15-.15.11-.11c0-1.19.36-3.12-.54-4l-9.23-9.23c-3.21-.37-9.15,5.22-10.07,6.18a1.68,1.68,0,0,1-1.47.5l-18.52,18.51,2.74,2.74-7.25,7.12a8.18,8.18,0,0,0-7.67-2l-.54-.12v-.11a8.19,8.19,0,0,0-2-8l-.09-.07,7.18-7.2,2.75,2.75,18.51-18.52a1.69,1.69,0,0,1,.51-1.47c1-1,6.54-6.91,6.16-10.07-5.07-5.09-9.19-9.2-9.2-9.23-.91-.89-2.84-.5-4-.53l-.11.11-.13-.13H205s-.07-.11-.11-.17l-3.58-3.58,8.63-8.62,3.89,3.9-.18.19c0,1.19-.64,3.36.27,4.28l6.92,6.93.7-.69,1.17,1.19L245.07,269,194.7,218.46c-1-1-12.89-13.13-13-24.31l.27-.26c11.18.09,24.43,12.88,24.43,12.88l50.33,50.33,50.38-50.33S320.4,194,331.59,193.86l.28.26c-.1,11.18-12,23.34-13,24.31l-50.33,50.39,22.37,22.37L292.1,290l.69.69c2.8-2.8,6.92-6.93,6.93-6.92.89-.89.22-3.11.26-4.28l-.18-.18,3.89-3.9,8.63,8.62-3.58,3.58-.1.17h-.09l-.15.13-.11-.11c-1.19,0-3.12-.37-4,.53l-9.16,9.36c-.37,3.19,5.22,9.15,6.17,10.07a1.66,1.66,0,0,1,.5,1.47l18.51,18.52,2.75-2.75,7.18,7.2a.4.4,0,0,0-.13.09Z" transform="translate(-27.04 -3.42)"/></svg>
    </SearchBarContainer>
    
    <Row justify='end' css={`marginRight: 28px;`}>
      {authenticated
        ? <Row justify='end' css={`margin-right: -15px`}>
            <StyledDropdown
              underlineStyle={{border: 'none'}}
              value={selectedAccount}
              onChange={handleAccountChange}>
              {mapAccounts(destinyAccounts)}
            </StyledDropdown>
            <IconButton onTouchTap={onFeedback} tooltip="Feedback">
              <FontIcon color={palette.secondaryText} className='material-icons'> help_outline </FontIcon>
            </IconButton>
            <IconButton onTouchTap={onLogout} tooltip="Logout">
              <FontIcon color={palette.secondaryText} className='material-icons'> exit_to_app </FontIcon>
            </IconButton>
          </Row>
        : <SignInButton label='Sign In' onTouchTap={onAuthorize}/>
      }
    </Row>
  </TopBar>
};

