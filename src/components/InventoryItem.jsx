import React from 'react';
import styled from 'emotion/react';
import {palette} from './styleguide';

const Item = styled.div `
  width: 45px;
  height: 45px;
  border-radius: 4px;
  background-size: cover;
  background-image: ${props => `url(https://bungie.net/${props.image})`};
  user-select: none;
  border: 2px solid ${props => props.max ? palette.lightLevel : palette.stroke};
`;

export default(props) => {
  return props.item && props.item.definition.icon
    ? <Item
        {...{style: props.style, className: props.className}}
        image={props.item.definition.icon}
        max={props.item.isGridComplete}
        key={`${props.item.itemId}-${props.item.itemHash}`}/> : undefined;
};