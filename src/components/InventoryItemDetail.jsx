import React from 'react';
import styled from 'emotion/react';
import {palette, z} from './styleguide';
import {keyframes} from 'emotion';
import {Row, Column, Text, Divider} from './styleguide';
import Stats from './Stats';
import Perks from './Perks';
import {fade} from 'material-ui/utils/colorManipulator';


const containerPadding = '12px';

const frames = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }

  to {
    opacity: 1;
    transfrom: none;
  }
`;

const rarityColorMap = {
  legendary: palette.legendary,
  exotic: palette.exotic,
  common: palette.common,
  rare: palette.rare
};

const damageHashMap = {
  3373582085: 'damage-kinetic',
  1847026933: 'damage-solar',
  2303181850: 'damage-arc',
  3454344768: 'damage-void'
};

const primaryStatHashMap = {
  368428387: 'ATTACK',
  3897883278: 'DEFENSE'
};

const damageTypeColorMap = {
  'damage-kinetic': palette.darkText,
  'damage-solar': '#f2721b',
  'damage-arc': '#85c5ec',
  'damage-void': '#b184c5'
};

const damageTypeIconMap = {
  'damage-kinetic': '/img/destiny_content/damage_types/kinetic.png',
  'damage-solar': '/img/destiny_content/damage_types/thermal.png',
  'damage-arc': '/img/destiny_content/damage_types/arc.png',
  'damage-void': '/img/destiny_content/damage_types/void.png'
};

const InventoryItemDetail = styled.div `
  width: 325px;
`;

const ItemHeader = styled.div`
  background-color: ${props => fade(props.rarity, .90)};
  padding: ${containerPadding};
  border-radius: 4px;
  margin-bottom: 4px;
  animation: ${frames} 350ms 1 ease;
  box-shadow: ${z.z2};
  -webkit-backdrop-filter: blur(10px);
`;

const bgColor = fade(palette.background, 0.90);

export default(props) => {
  const rarityColor = rarityColorMap[props.item.definition.tierTypeName.toLowerCase()];
  const damageColor = damageTypeColorMap[damageHashMap[props.item.damageTypeHash]];
  
  return <div css={`position: absolute; z-index: 1000;`} {...props}>
    {props.item 
      ? <InventoryItemDetail>
          <ItemHeader rarity={rarityColor}>
            <Text white size={2} bold>{props.item.definition.itemName.toUpperCase()}</Text>
            <Row justify='space-between' css={`margin-top: 4px;`}>
              <Text>{props.item.definition.itemTypeName}</Text>
              <Text>{props.item.definition.tierTypeName}</Text>
            </Row>
          </ItemHeader>

          <Column justify='start' align='start' css={`padding: ${containerPadding}; background-color: ${bgColor}; border-radius: 4px; animation: ${frames} 650ms 1 ease; margin-bottom: 4px; box-shadow: ${z.z2}; -webkit-backdrop-filter: blur(10px);`}>
            <Column justify='start' align='start' css={`margin-bottom: 14px`}>
              <Text css={`color: ${damageColor} !important;`} bold size={4}>{props.item.primaryStat ? props.item.primaryStat.value : 0}</Text>
              <Text css={`color: ${damageColor} !important;`}>{props.item.primaryStat ? primaryStatHashMap[props.item.primaryStat.statHash] : ''}</Text>
            </Column>
            <Text gray italic> {props.item.definition.itemDescription} </Text>
          </Column>

          {props.stats
            ? <Column justify='start' align='start' css={`padding: ${containerPadding}; background-color: ${bgColor}; border-radius: 4px; animation: ${frames} 950ms 1 ease; margin-bottom: 4px; box-shadow: ${z.z2}; -webkit-backdrop-filter: blur(10px);`}>
              <Stats stats={props.stats} itemStatType={props.item.primaryStat ? primaryStatHashMap[props.item.primaryStat.statHash] : ''}/>
            </Column>
            : ''
          }

          {props.perks
            ? <Column justify='start' align='start' css={`padding: ${containerPadding}; background-color: ${bgColor}; border-radius: 4px; animation: ${frames} 1250ms 1 ease; margin-bottom: 4px; box-shadow: ${z.z2}; -webkit-backdrop-filter: blur(10px);`}>
              <Perks perks={props.perks}/>
            </Column>
            : ''
          }
        </InventoryItemDetail>
      :''
    }
  </div>
};