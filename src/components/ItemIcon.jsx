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
  position: relative;

  &::after {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(255,255,255,0.5);
    font-size: 10px;
    padding: 0 2px;
    border-radius: 2px;
    margin: 1px;
    font-weight: 500;
    content: '${props => props.lightLevel ? props.lightLevel : ''}';
  }
`;

export default(props) => {
  return props.item && props.item.definition.icon
    ? <Item
        {...{style: props.style, className: props.className}}
        image={props.item.definition.icon}
        max={props.item.isGridComplete}
        lightLevel={props.item.primaryStat ? props.item.primaryStat.value : false}
        key={`${props.item.itemId}-${props.item.itemHash}`}/> : undefined;
};