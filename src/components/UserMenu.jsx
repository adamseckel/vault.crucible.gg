

import React, {Component} from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {IconButton, FontIcon, Popover, List, ListItem} from 'material-ui';
import TextField from 'material-ui/TextField';
import {palette, z, Row} from './styleguide';
import styled from 'emotion/react';

import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ContentSend from 'material-ui/svg-icons/content/send';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  
  handleOpen = (event) => {
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    return (
      <div>
        <IconButton onTouchTap={this.handleOpen}>
          <FontIcon color={palette.secondaryText} className='material-icons'> more_vert </FontIcon>
        </IconButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleClose}
        >
          <List>
            <ListItem primaryText="Inbox" leftIcon={<ContentInbox />} />
            <ListItem primaryText="Starred" leftIcon={<ActionGrade />} />
            <ListItem primaryText="Sent mail" leftIcon={<ContentSend />} />
            <ListItem primaryText="Drafts" leftIcon={<ContentDrafts />} />
            <ListItem primaryText="Inbox" leftIcon={<ContentInbox />} />
          </List>
        </Popover>
      </div>
    );
  }
}

export default muiThemeable()(SearchBar);
