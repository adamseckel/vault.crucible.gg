import React from 'react';
import styled from 'emotion/react';
import {palette, z} from './styleguide';
import {keyframes} from 'emotion';
import {Row, Column, Text, Divider} from './styleguide';
import {fade} from 'material-ui/utils/colorManipulator';

const PerkIcon = styled.img`
  width: 30px;
  filter: invert(100%);
  margin-right: 12px;
  opacity: .6;
`;

const PerkRow = styled(Row)`
  margin-bottom: 8px;
  opacity: ${props => props.active ? 1 : 0.4};
  
  &:last-child {
    margin: 0;
  }
`;

export default(props) => {
  function mapPerks(perks) {
    return perks.map((perk) => 
      <PerkRow justify='start' align='start' active={perk.isActive}>
        <PerkIcon src={`https://bungie.net${perk.displayIcon}`} alt={perk.displayName}/>
        <Text gray> {perk.displayDescription} </Text>
      </PerkRow>
    );
  }

  return <div {...props}>
    {props.perks ? mapPerks(props.perks) : ''}
  </div>
};