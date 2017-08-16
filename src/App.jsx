import React, {Component} from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import styled from 'emotion/react';
import keyframes from 'emotion';
import {MuiThemeProvider, getMuiTheme} from 'material-ui/styles';
import {AppBar, FontIcon, IconButton, FlatButton} from 'material-ui';
import {palette, muiThemeDeclaration, Row} from './components/styleguide';
import {SearchBar, ManagerGrid} from './components';
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bungieRequestService: false,
      authenticated: false,
      membership: {},
      characters: [],
      items: {}
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
          const vaultColumns = calculateVaultColumns(characters, this.state.clientWidth);

          return itemService.getItems(this.state.clientWidth).then((items) => {
            this.setState({
              characters,
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

  moveItem = (itemReferenceHash, itemId, characterId, vault) => {
    return this.state.itemService.moveItem(itemReferenceHash, itemId, characterId, vault);
  }

  equipItem = (itemId, characterId) => {
    return this.state.itemService.equipItem(itemId, characterId);
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
                    <IconButton onTouchTap={this.onLogout}>
                      <FontIcon color={palette.secondaryText} className='material-icons'> exit_to_app </FontIcon>
                    </IconButton>
                  </Row>
                : <SignInButton label='Sign In' onTouchTap={this.onAuthorize}/>
              }
            </Row>
          </TopBar>
          {this.state.authenticated ? 
            <ManagerGrid 
              moveItem={this.moveItem}
              equipItem={this.equipItem}
              vaultColumns={this.state.vaultColumns}
              characters={this.state.characters}
              items={this.state.items}
              query={this.state.query}/>
            : ''
          }
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
