import React, {Component} from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import styled from 'emotion/react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';
import {muiThemeDeclaration} from './components/styleguide';
import {InventoryGrid, SnackbarContainer, LocationsRow, Landing, TopBar, TwitterBadge} from './components';
import Store from './Store';

injectTapEventPlugin();

const muiTheme = getMuiTheme(muiThemeDeclaration);

const StyledTopBar = styled(TopBar)`
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

class App extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div className='App'>
          <Store firebaseService={this.props.firebaseService} apiKey={this.props.apiKey}>
            {({state, actions}) =>
              <div>
                <StyledTopBar 
                  searchForItem={actions.searchForItem}
                  authenticated={state.authenticated}
                  onReload={actions.onReload}
                  onLogout={actions.onLogout}
                  onAuthorize={actions.onAuthorize}
                  SignInButton={SignInButton}/>

                {state.authenticated
                  ? <div>
                    <LocationsRow characters={state.characters} vault={state.vault} />
                    <InventoryGrid 
                      moveItem={actions.moveItem}
                      getItemDetail={actions.getItemDetail}
                      vaultColumns={state.vaultColumns}
                      characters={state.charactersByID}
                      clientWidth={state.clientWidth}
                      clientXY={state.clientXY}
                      items={state.items}
                      startInventoryPolling={actions.startInventoryPolling}
                      stopInventoryPolling={actions.stopInventoryPolling}
                      query={state.query}/>
                  </div>
                  : <Landing onAuthorize={actions.onAuthorize} SignInButton={SignInButton}/>
                }
                <StyledSnackbarContainer messages={state.notifications}/>
              </div>
            }
          </Store>
          <TwitterBadge/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
