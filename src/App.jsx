import React, {Component} from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import styled from 'emotion/react';
import {MuiThemeProvider, getMuiTheme} from 'material-ui/styles';
import {darkPalette, muiThemeDeclaration} from './components/styleguide';
import {ManagerGrid, SnackbarContainer, TopBar} from './components';
import BungieAuthorizationService from './services/BungieAuthorization';
import BungieRequestService from './services/BungieRequest';
import ItemService from './services/ItemService';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

injectTapEventPlugin();

const muiTheme = getMuiTheme(muiThemeDeclaration);
const darkMuiTheme = getMuiTheme(Object.assign(muiThemeDeclaration), {
  palette: darkPalette
});

const StyledSnackbarContainer = styled(SnackbarContainer)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 300;
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
      theme: 'default'
    }
  }

  onAuthorize = () => {
    return window.open(`https://www.bungie.net/en/OAuth/Authorize?client_id=${apiKey.client_id}&response_type=code`,"_self");
  }

  componentDidMount() {
    this.setState({clientWidth: this.refs.grid.clientWidth});

    BungieAuthorizationService(apiKey).then((authorization) => {
      this.setState({
        bungieRequestService: BungieRequestService(authorization, apiKey.key, 1)
      });

      ItemService(this.state.bungieRequestService).then((itemService) => {
        if (itemService) {
          const membership = itemService.rawMembership;
          const authenticated = true;
          this.setState({itemService, membership, authenticated});
          window.addEventListener("resize", this.updateWidth);
          const characters = itemService.getCharacters();
          const charactersByID = characters.map((character) => {
            return [character.characterId, character];
          }).reduce((o, [k, val]) => {
            o[k] = val;
            return o;
          }, {});
          const vaultColumns = calculateVaultColumns(characters, this.state.clientWidth);

          return itemService.getItems(this.state.clientWidth).then((items) => {
            this.setState({
              characters,
              charactersByID,
              items,
              vaultColumns
            });
          });
        }
      });
    });
  }

  searchForItem = (event, query) => {
    this.setState({query});
  }

  onToggleTheme = () => {
    this.setState({
      theme: this.state.theme === 'default' ? 'dark' : 'default'
    });
  }

  moveItem = (itemReferenceHash, itemId, characterId, vault) => {
    return this.state.itemService.moveItem(itemReferenceHash, itemId, characterId, vault).then(({status, statusText, data}) => {
      const stamp = Date.now();
      this.setState({
        notifications: Object.assign({}, this.state.notifications, {
          [stamp]: {status, statusText, message: data.ErrorStatus, timestamp: Date.now()}
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
    })
  }

  equipItem = (itemId, characterId) => {
    return this.state.itemService.equipItem(itemId, characterId).then(this.updateCharacters);
  }

  updateCharacters = (characterID) => {
    const {characterId, membershipId} = this.state.charactersByID[characterID];
    return this.state.itemService.updateCharacter(characterId, membershipId).then((character) => {
      console.log(character.powerLevel)
      this.setState({
        charactersByID: Object.assign(this.state.charactersByID, {
          [characterID]: character
        })
      });
      console.log(this.state.charactersByID[characterID].powerLevel)
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
    const theme = this.state.theme === 'default' ? muiTheme : darkMuiTheme;
    return (
      <MuiThemeProvider muiTheme={theme}>
        <div className='App' ref='grid' css={`background-color: ${theme.palette.canvasColor}; transition: background-color 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;`}>
          <TopBar 
            authorized={this.state.authenticated}
            onReload={this.onReload}
            onAuthorize={this.onAuthorize}
            onLogout={this.onLogout}
            onToggleTheme={this.onToggleTheme}
            onSearchForItem={this.searchForItem}/>
          
          {this.state.authenticated ? 
            <ManagerGrid 
              moveItem={this.moveItem}
              equipItem={this.equipItem}
              vaultColumns={this.state.vaultColumns}
              characters={this.state.charactersByID}
              items={this.state.items}
              query={this.state.query}/>
            : ''
          }
          <StyledSnackbarContainer messages={this.state.notifications}/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
