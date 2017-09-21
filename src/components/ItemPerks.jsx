import React from 'react';
import styled from 'emotion/react';
import {Row, Column, Text} from './styleguide';

const PerkIcon = styled.img`
  width: ${props => props.mod ? '26px' : '30px'};
  margin: ${props => props.mod ? '2px 14px 2px 2px' : '0 12px 0 0'};
  border-radius: 4px;    
`;

const PerkRow = styled(Row)`
  margin-bottom: 8px;
  border-radius: 4px;
  
  &:last-child {
    margin: 0;
  }
`;

export default({perksDefinitions, perks, className, style}) => {
  function mapPerks(perkList) {
    return perkList
      .filter((perk) => perk.visible)
      .map((perk) => {
        const description = perksDefinitions[perk.perkHash].displayProperties.description.split('\n');
        return {
          ...perk,
          description: description[description.length - 1],
          name:  perksDefinitions[perk.perkHash].displayProperties.name,
          isMod: perksDefinitions[perk.perkHash].displayProperties.name.split(' ').includes('Mod') || perksDefinitions[perk.perkHash].displayProperties.name.split(' ').includes('Module')
        }
      })
      .map((perk) => 
        <PerkRow justify='start' align='start' key={perk.perkHash} >
          {perk.iconPath && <PerkIcon mod={perk.isMod} src={`https://bungie.net${perk.iconPath}`} alt={perk.name}/>}
          <Column justify='start' align='start'>
            <Text white> {perk.name} </Text>
            <Text size='0' gray> {perk.description} </Text>
          </Column>
        </PerkRow>
      );
  }

  return <div {...{className, style}}>
    {perks && mapPerks(perks)}
  </div>
};