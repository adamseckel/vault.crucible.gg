import React, {Component} from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import styled from 'emotion/react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import {palette, animations, muiThemeDeclaration, Row, Column, Text} from './components/styleguide';
import {SearchBar, InventoryGrid, SnackbarContainer, UserMenu, LocationsRow} from './components';
import {BungieAuthorizationService, BungieRequestService, ItemService, store} from './services';

injectTapEventPlugin();

const muiTheme = getMuiTheme(muiThemeDeclaration);

const TopBar = styled(AppBar)`
  border-bottom: 1px solid ${palette.stroke} !important;
  padding-left: 50px !important;
  position: fixed !important;
  top: 0 !important;
`;

const StyledSnackbarContainer = styled(SnackbarContainer)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 300;
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

const SignInButton = styled(FlatButton)`
  span {
    font-size: 16px !important;
  }
`;

const ReloadIcon = styled(FontIcon)`
  transition: all .3s linear;
`;

const Logo = styled.svg`
  width: 30px;
`;

const apiKey = {
  client_id: process.env.REACT_APP_CLIENT_ID || '13756',
  key: process.env.REACT_APP_APIKEY || '43e0503b64df4ebc98f1c986e73d92ac',
  client_secret: process.env.REACT_APP_CLIENT_SECRET || 'm7aOvxvaLgAfeLkT4QC6mg1fyl81iZBt5ptzkq4Pay0'
};

const vault = {
  characterLevel: '',
  characterBase: {
    classHash: 'vault',
    raceHash: 'full',
    powerLevel: ''
  },
  id: 4567
};

function calculateVaultColumns(characters, gridWidth) {
  return Math.floor((gridWidth - 90 - (271 * characters.filter((store) => {
    return store.key !== 'vault';
  }).length)) / 52);
}

function removeSplash() {
  const splash = document.getElementById("splash");
  splash.className = "removed";
  setTimeout(() => {
    splash.parentNode.removeChild(splash);
  }, 400);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bungieRequestService: false,
      authenticated: false,
      membership: {},
      characters: [],
      items: {},
      notifications: {},
      platform: 'xb1',
      vault,
      poller: {
        count: 0
      }
    }
  }

  onAuthorize = () => {
    return window.location.replace(`https://www.bungie.net/en/OAuth/Authorize?client_id=${apiKey.client_id}&response_type=code`);
  }

  componentDidMount() {
    this.setState({clientWidth: this.refs.grid.clientWidth});

    return BungieAuthorizationService(apiKey).then((authorization) => {
      return BungieRequestService(authorization, apiKey.key).getMembershipById().then((membership) => {
        const destinyMembership = membership.destinyMemberships[0];
        const authenticated = true;
        const bungieRequestService = BungieRequestService(authorization, apiKey.key, destinyMembership.membershipType);
        const itemService = ItemService(bungieRequestService, membership);

        this.setState({
          bungieRequestService,
          membership,
          destinyMembership,
          authenticated,
          itemService
        });
        this.updateWidth();
        window.addEventListener("resize", this.updateWidth);

        return itemService.getCharacters(destinyMembership.membershipId).then((characters) => {
          removeSplash();

          const charactersByID = characters.map((character) => {
            return [character.characterBase.characterId, Object.assign(character, {characterId: character.characterBase.characterId})];
          }).reduce((o, [k, val]) => {
            o[k] = val;
            return o;
          }, {});

          const vaultColumns = calculateVaultColumns(characters, this.state.clientWidth);
          
          this.setState({
            characters,
            charactersByID,
            vaultColumns
          });

          return itemService.getItems(this.state.clientWidth).then((items) => {
            this.setState({
              items
            });
          });
        })
      })
    }).catch((error) => {
      removeSplash();
      console.log(error.message);
    });
  }

  searchForItem = (event, query) => {
    this.setState({query});
  }

  startInventoryPolling = () => {
    if (!this.state.authenticated) return;
    if (this.state.inventoryPollingDelay) {
      clearTimeout(this.state.inventoryPollingDelay);
    }
    if (this.state.inventoryPollingInterval) {
      clearTimeout(this.state.inventoryPollingInterval);
    }
    const instance = Date.now();
    console.log('Start Poll', instance);
    const inventoryPollingDelay = setTimeout(() => {
      this.inventoryPoll(0, instance);
    }, 5000);

    this.setState({
      inventoryPollingDelay
    });
  }

  inventoryPoll = (count, instance) => {
    console.log('Poll', count, instance)
    const basePollingInterval = 15000;
    const ppm = 60000 / basePollingInterval;
    const pollDelay = count > (ppm * 5) ? (count / (ppm * 5)) * basePollingInterval : basePollingInterval;
    const inventoryPollingInterval = setTimeout(() => {
      if (!this.state.authenticated) return;
      return this.state.itemService.getItems(this.state.clientWidth).then((items) => {
        this.setState({items});
        return this.inventoryPoll(count + 1, instance);
      }).catch((error) => {
        console.log(`Polling Error: ${error.message}`);
      });
    }, pollDelay);

    return this.setState({
      inventoryPollingInterval
    });
  }

  stopInventoryPolling = () => {
    console.log('Stop Polling')
    clearTimeout(this.state.inventoryPollingInterval);
    clearTimeout(this.state.inventoryPollingDelay);
    this.setState({
      inventoryPollingInterval: undefined,
      inventoryPollingDelay: undefined
    });
  }

  getItemDetail = (characterID, itemInstanceID) => {
    const {membershipId} = this.state.destinyMembership;
    return this.state.itemService.getItemDetail(membershipId, characterID, itemInstanceID);
  }

  createTransferPromise = (itemReferenceHash, itemId, lastCharacterID, initialCharacterID, shouldEquip) => {
    const toVault = lastCharacterID === 'vault';
    const fromVault = initialCharacterID === 'vault';

    if (shouldEquip && lastCharacterID === initialCharacterID) {
      return this.state.itemService.equipItem(itemId, lastCharacterID);
    }

    const isSpecificVaultTransaction = toVault || fromVault;
    const characterID = isSpecificVaultTransaction
      ? (toVault ? initialCharacterID : lastCharacterID)
      : initialCharacterID;
    const isVaultTransaction = isSpecificVaultTransaction
      ? toVault
      : true;
    
    return this.state.itemService.moveItem(itemReferenceHash, itemId, characterID, isVaultTransaction).then((result) => {
      return (fromVault && shouldEquip)
        ? this.state.itemService.equipItem(itemId, lastCharacterID)
        : !isSpecificVaultTransaction
          ? this.state.itemService.moveItem(itemReferenceHash, itemId, lastCharacterID).then((result) => {
            return shouldEquip ? this.state.itemService.equipItem(itemId, lastCharacterID) : result;
          })
          : result;
    });
  }

  moveItem = (itemReferenceHash, itemId, lastCharacterID, initialCharacterID, shouldEquip) => {
    return this.createTransferPromise(itemReferenceHash, itemId, lastCharacterID, initialCharacterID, shouldEquip)
      .then(() => this.addNotification('Success'))
      .catch((error) => {
        this.addNotification(error.message);
        throw new Error(error.message);
      });
  }

  addNotification = (message) => {
    const stamp = Date.now();
    this.setState({
      notifications: Object.assign({}, this.state.notifications, {
        [stamp]: {message, timestamp: Date.now()}
      })
    });
    
    setImmediate(() => {
      this.setState({
        notifications: Object.assign({}, this.state.notifications, {
          [stamp]: Object.assign(this.state.notifications[stamp], {
            rendered: true
          })
        })
      });
    })

    setTimeout(() => {
      this.setState({
        notifications: Object.assign({}, this.state.notifications, {
          [stamp]: Object.assign(this.state.notifications[stamp], {
            rendered: false
          })
        })
      })
    }, 3000);
  }

  updateCharacters = (characterID) => {
    const {characterId, membershipId} = this.state.charactersByID[characterID];
    return this.state.itemService.updateCharacter(characterId, membershipId).then((character) => {
      this.setState({
        charactersByID: Object.assign(this.state.charactersByID, {
          [characterID]: character
        })
      });
    });
  }

  updateWidth = () => {
    this.setState({
      clientWidth: this.refs.grid.clientWidth,
      clientXY: [this.refs.grid.clientWidth, window.innerHeight],
      vaultColumns: calculateVaultColumns(this.state.characters, this.refs.grid.clientWidth)
    });
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", () => this.updateWidth());
  }

  onReload = () => {
    this.setState({reloading: true})
    return this.state.itemService.getItems(this.state.clientWidth)
      .then((characterItems) => {
        this.setState({
          characters: this.state.itemService.getCharacters(),
          items: characterItems,
          reloading: false
        });
      });
  }

  onLogout = () => {
    return store.delete('Vault::Authorization').then(() => {
      this.setState({
        authenticated: false,
        characters: undefined,
        items: undefined,
        itemService: undefined,
        bungieRequestService: undefined
      });
    });
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className='App' ref='grid'>
          <TopBar
            title='VAULT'
            zDepth={0}
            showMenuIconButton={false}
            titleStyle={{
              color: palette.secondaryText,
              textAlign: 'left'
            }}>
            <SearchBarContainer>
              {this.state.authenticated ? <SearchBar onChange={this.searchForItem}/> : undefined}
              <svg css={`width: 30px; position: absolute; z-index: 1; top: 0; bottom: 0; margin: auto; left: 0; right: 0;`} viewBox="0 0 457.92 506.82"><polyline points="426.79 261.25 448.23 282.69 229.75 501.16 11.27 282.69 32.08 261.88" style={{fill: 'none', stroke: '#000', strokeMiterlimit:10, strokeWidth:'8px'}}/><polygon points="229.63 56.79 429.95 258.1 457.92 230.13 229.63 0 0 230.04 28.78 258.82 229.63 56.79"/><path d="M257.1,74.19,62.66,268.62l193.6,193.65L450.67,267.83Zm73.05,258.06a8.22,8.22,0,0,0-2,8v.11l-.5.12a8.18,8.18,0,0,0-7.68,2l-7.25-7.12,2.74-2.74-18.52-18.51a1.69,1.69,0,0,1-1.48-.5c-1-1-6.89-6.55-10.07-6.18l-9.23,9.23c-.91.91-.5,2.83-.54,4l.11.11-.15.15V321c0,.08-.12.06-.17.1l-3.57,3.58-8.63-8.62,3.9-3.89.19.18c1.17,0,3.36.64,4.28-.27l6.93-6.93-.7-.69,1.5-1.5-22.37-22.37L234.58,303l1.5,1.5-.69.69,6.93,6.93c.89.91,3.1.25,4.28.27l.18-.18,3.9,3.89-8.85,8.62-3.58-3.58a.3.3,0,0,1-.17-.1s0-.06,0-.08l-.15-.15.11-.11c0-1.19.36-3.12-.54-4l-9.23-9.23c-3.21-.37-9.15,5.22-10.07,6.18a1.68,1.68,0,0,1-1.47.5l-18.52,18.51,2.74,2.74-7.25,7.12a8.18,8.18,0,0,0-7.67-2l-.54-.12v-.11a8.19,8.19,0,0,0-2-8l-.09-.07,7.18-7.2,2.75,2.75,18.51-18.52a1.69,1.69,0,0,1,.51-1.47c1-1,6.54-6.91,6.16-10.07-5.07-5.09-9.19-9.2-9.2-9.23-.91-.89-2.84-.5-4-.53l-.11.11-.13-.13H205s-.07-.11-.11-.17l-3.58-3.58,8.63-8.62,3.89,3.9-.18.19c0,1.19-.64,3.36.27,4.28l6.92,6.93.7-.69,1.17,1.19L245.07,269,194.7,218.46c-1-1-12.89-13.13-13-24.31l.27-.26c11.18.09,24.43,12.88,24.43,12.88l50.33,50.33,50.38-50.33S320.4,194,331.59,193.86l.28.26c-.1,11.18-12,23.34-13,24.31l-50.33,50.39,22.37,22.37L292.1,290l.69.69c2.8-2.8,6.92-6.93,6.93-6.92.89-.89.22-3.11.26-4.28l-.18-.18,3.89-3.9,8.63,8.62-3.58,3.58-.1.17h-.09l-.15.13-.11-.11c-1.19,0-3.12-.37-4,.53l-9.16,9.36c-.37,3.19,5.22,9.15,6.17,10.07a1.66,1.66,0,0,1,.5,1.47l18.51,18.52,2.75-2.75,7.18,7.2a.4.4,0,0,0-.13.09Z" transform="translate(-27.04 -3.42)"/></svg>
            </SearchBarContainer>
            
            <Row justify='end' css={`marginRight: 28px;`}>
              {this.state.authenticated
                ? <Row justify='end' css={`margin-right: -15px`}>
                    <IconButton onTouchTap={this.onReload}>
                      <ReloadIcon color={palette.secondaryText} className='material-icons'>refresh</ReloadIcon>
                    </IconButton>
                    <UserMenu onLogout={this.onLogout}/>
                  </Row>
                : <SignInButton label='Sign In' onTouchTap={this.onAuthorize}/>
              }
            </Row>
          </TopBar>
          {this.state.authenticated ? 
            <div>
              <LocationsRow characters={this.state.characters} vault={this.state.vault} />

              <InventoryGrid 
                moveItem={this.moveItem}
                getItemDetail={this.getItemDetail}
                vaultColumns={this.state.vaultColumns}
                characters={this.state.charactersByID}
                clientWidth={this.state.clientWidth}
                clientXY={this.state.clientXY}
                items={this.state.items}
                startInventoryPolling={this.startInventoryPolling}
                stopInventoryPolling={this.stopInventoryPolling}
                query={this.state.query}/>
            </div>
            
            : <Column css={`composes: ${animations.fadeInSlow}; position: absolute; top: 60px; bottom: 0; left: 0; right: 0;`}>
              <Text center gray css={`opacity: 0.05; position: absolute; left: 0; right: 0; top: 0; bottom: 0;`} size={'max'}>2</Text>
              <Text title light size={4} css={`composes: ${animations.fadeInSlow}; animation-delay: 500ms; opacity: 0; margin-bottom: 20px;`}>vault.crucible.gg</Text>
              <Text gray size={2} css={`composes: ${animations.fadeInSlow}; animation-delay: 1000ms; opacity: 0; margin-bottom: 20px;`} o> Fast, Simple, Gear Management and Loadouts for Destiny 2. </Text>
              <SignInButton css={`composes: ${animations.fadeInSlow}; animation-delay: 1500ms; opacity: 0;`} label='Sign In' onTouchTap={this.onAuthorize}/>
            </Column>
          }
          <StyledSnackbarContainer messages={this.state.notifications}/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
