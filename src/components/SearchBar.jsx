import React, {Component} from 'react';

import muiThemeable from 'material-ui/styles/muiThemeable';
import FontIcon from 'material-ui/FontIcon';
import TextField from 'material-ui/TextField';
import {palette, animations, z, Row} from './styleguide';
import styled from 'emotion/react';

const SearchBox = styled(Row)`
  composes: ${animations.fadeIn};
  padding: 0;
  width: 100%;
  border-radius: 4px;
  z-index: 2;
  background-color: ${palette.stroke};
`;

const FocusedSearchBoxBg = styled.div `
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 4px;
  background-color: ${palette.secondaryText};
  box-shadow: ${z.z2};
  transition: opacity .3s ease;
  opacity: ${props => props.focused
  ? 1
  : 0};
  z-index: 2;
`;

const SearchIcon = styled(FontIcon)`
  margin: 0 8px !important;
  color: ${props => props.focused
  ? palette.stroke
  : palette.secondaryText} !important;
  z-index: 3;
`;

const TextBox = styled(TextField)`
  z-index: 3;
  & div {
    color: ${props => props.focused
  ? palette.stroke
  : palette.secondaryText} !important;
  }
  & input {
    color: ${props => props.focused
    ? palette.stroke
    : palette.secondaryText} !important;
  }
`;

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearchFocused: false
    };
  }

  focusInput = () => {
    return this.setState({isSearchFocused: true});
  }

  blurInput = () => {
    return this.setState({isSearchFocused: false});
  }

  render() {
    return (
      <SearchBox justify='start' className={this.props.className}>
        <FocusedSearchBoxBg focused={this.state.isSearchFocused}/>
        <SearchIcon className="material-icons" focused={this.state.isSearchFocused}>search</SearchIcon>
        <TextBox
          onFocus={this.focusInput}
          onBlur={this.blurInput}
          focused={this.state.isSearchFocused}
          hintText="Search for an Item"
          underlineShow={false}
          fullWidth={true}
          onChange={this.props.onChange}/>
      </SearchBox>
    );
  }
}

export default muiThemeable()(SearchBar);
