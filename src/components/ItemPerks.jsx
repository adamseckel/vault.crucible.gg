import React from 'react';
import styled from 'emotion/react';
import {Row, Text} from './styleguide';

const PerkIcon = styled.img`
  width: 30px;
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

export default({perks, className, style}) => {
  function mapPerks(perkList) {
    return perkList.map((perk) => 
      <PerkRow justify='start' align='start' active={perk.isActive} key={perk.perkHash}>
        {perk.displayIcon && <PerkIcon src={`https://bungie.net${perk.displayIcon}`} alt={perk.displayName}/>}
        <Text gray> {perk.displayDescription} </Text>
      </PerkRow>
    );
  }

  return <div {...{className, style}}>
    {perks && mapPerks(perks)}
  </div>
};