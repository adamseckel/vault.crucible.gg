import React, {Component} from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import styled from 'emotion/react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import {palette, muiThemeDeclaration, Row} from './components/styleguide';
import {SearchBar, InventoryGrid, SnackbarContainer, UserMenu} from './components';
import BungieAuthorizationService from './services/BungieAuthorization';
import BungieRequestService from './services/BungieRequest';
import ItemService from './services/ItemService';

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

const SignInButton = styled(FlatButton)`
  span {
    font-size: 16px !important;
  }
`;

const ReloadIcon = styled(FontIcon)`
  transition: all .3s linear;
`;

const apiKey = {
  client_id: process.env.REACT_APP_CLIENT_ID || '13756',
  key: process.env.REACT_APP_APIKEY || '43e0503b64df4ebc98f1c986e73d92ac',
  client_secret: process.env.REACT_APP_CLIENT_SECRET || 'm7aOvxvaLgAfeLkT4QC6mg1fyl81iZBt5ptzkq4Pay0'
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

        window.addEventListener("resize", this.updateWidth);

        return itemService.getCharacters(destinyMembership.membershipId).then((characters) => {
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
            removeSplash();

            this.setState({
              items
            });
          });
        })
      })
    }).catch((error) => {
      console.log(error.message);
    });
  }

  searchForItem = (event, query) => {
    this.setState({query});
  }

  startInventoryPolling = () => {
    if (this.state.pollingDelay) {
      clearTimeout(this.state.pollingDelay);
    }
    if (this.state.inventoryPollingInterval) {
      clearInterval(this.state.inventoryPollingInterval);
    }

    const pollingDelay = setTimeout(() => {
      const now = Date.now();
      const inventoryPollingInterval = setInterval(() => {
        if (this.state.poller.instance === now && this.state.poller.count > 50) {
          return this.stopInventoryPolling();
        }
        return this.state.itemService.getItems(this.state.clientWidth).then((items) => {
          this.setState({
            items,
            poller: {
              instance: now,
              count: (this.state.poller.count || 0 ) + 1
            }
          });
        }).catch((error) => {
          console.log(`Polling Error: ${error.message}`);
        })
      }, 10000);

      this.setState({
        inventoryPollingInterval
      });
    }, 1000);

    this.setState({
      pollingDelay
    });
  }

  stopInventoryPolling = () => {
    clearInterval(this.state.inventoryPollingInterval);
    clearTimeout(this.state.pollingDelay);
    this.setState({inventoryPollingInterval: undefined, pollingDelay: undefined, poller : {
      instance: undefined,
      count: 0
    }})
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
    this.setState({
      authenticated: false,
      characters: undefined,
      items: undefined,
      itemService: undefined,
      bungieRequestService: undefined
    })
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
            <SearchBar onChange={this.searchForItem}/>
            <Row justify='end' css={`marginRight: 28px;`}>


              {this.state.authenticated
                ? <Row justify='end' css={`margin-right: -15px`}>
                    <IconButton onTouchTap={this.onReload}>
                      <ReloadIcon color={palette.secondaryText} className='material-icons'>refresh</ReloadIcon>
                    </IconButton>
                    <UserMenu/>
                  </Row>
                : <SignInButton label='Sign In' onTouchTap={this.onAuthorize}/>
              }
            </Row>
          </TopBar>
          {this.state.authenticated ? 
            <InventoryGrid 
              moveItem={this.moveItem}
              getItemDetail={this.getItemDetail}
              vaultColumns={this.state.vaultColumns}
              characters={this.state.charactersByID}
              items={this.state.items}
              startInventoryPolling={this.startInventoryPolling}
              stopInventoryPolling={this.stopInventoryPolling}
              query={this.state.query}/>
            : undefined
          }
          <StyledSnackbarContainer messages={this.state.notifications}/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
