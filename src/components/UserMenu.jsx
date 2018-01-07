import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Popover from 'material-ui/Popover';
import Divider from 'material-ui/Divider';
import { List, ListItem } from 'material-ui/List';
import Toggle from 'material-ui/Toggle';
import { palette, Text } from './styleguide';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleOpen = event => {
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
      <div>
        <IconButton onTouchTap={this.handleOpen}>
          <FontIcon color={palette.secondaryText} className="material-icons">
            {' '}
            more_vert{' '}
          </FontIcon>
        </IconButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          onRequestClose={this.handleClose}
          css={`
            min-width: 250px;
          `}
        >
          <List
            css={`
              padding: 0 !important;
            `}
          >
            <ListItem
              innerDivStyle={{ color: palette.secondaryText }}
              primaryText="Night Mode"
              leftIcon={
                <FontIcon
                  css={`
                    transform: rotateZ(150deg);
                  `}
                  color={palette.secondaryText}
                  className="material-icons"
                >
                  {' '}
                  brightness_2{' '}
                </FontIcon>
              }
              rightToggle={<Toggle onTouchTap={this.props.onToggleTheme} />}
            />
            <Divider />
            <ListItem
              innerDivStyle={{ color: palette.secondaryText }}
              onTouchTap={this.props.onLogout}
              leftIcon={
                <FontIcon color={palette.secondaryText} className="material-icons">
                  {' '}
                  exit_to_app{' '}
                </FontIcon>
              }
            >
              <Text gray> Sign Out</Text>
            </ListItem>
          </List>
        </Popover>
      </div>
    );
  }
}

export default muiThemeable()(SearchBar);
