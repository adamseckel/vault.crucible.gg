import React from 'react';
import styled from 'emotion/react';
import {palette, z} from './styleguide';
import {keyframes} from 'emotion';
import {Row, Column, Text, Divider} from './styleguide';
import {ItemStats, ItemPerks, ItemDescription} from './index';
import {fade} from 'material-ui/utils/colorManipulator';
import {ReactHeight} from 'react-height';

const containerPadding = '12px';

const frames = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }

  40% {
    opacity: 1;
    transform: translate3d(0, -5px, 0);
  }

  60% {
    opacity: 1;
    transform: translate3d(0, 2px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const rarityColorMap = {
  legendary: palette.legendary,
  exotic: palette.exotic,
  common: palette.common,
  uncommon: palette.uncommon,
  rare: palette.rare
};

const damageHashMap = {
  0: 'none',
  1: 'kinetic',
  3: 'solar',
  2: 'arc',
  4: 'void',
  5: 'raid'
};

const primaryStatHashMap = {
  1480404414: 'ATTACK',
  3897883278: 'DEFENSE'
};

const damageTypeColorMap = {
  'kinetic': palette.background,
  'solar': '#f2721b',
  'arc': '#85c5ec',
  'void': '#b184c5'
};
const bgColor = fade(palette.darkText, 0.95);

const damageTypeIconMap = {
  'kinetic': '/img/destiny_content/damage_types/kinetic.png',
  'solar': '/img/destiny_content/damage_types/thermal.png',
  'arc': '/img/destiny_content/damage_types/arc.png',
  'void': '/img/destiny_content/damage_types/void.png'
};

const ItemHeader = styled.div`
  background-color: ${props => fade(props.rarity, .95)};
  animation: ${props => props.render ? `${frames} 550ms 1 ease-in-out forwards` : 'none'};
  padding: ${containerPadding}; 
  border-radius: 4px;
  margin-bottom: 2px;
  opacity: 0;  
  box-shadow: ${z.z2};
  -webkit-backdrop-filter: blur(10px);
  user-select: none;  
`;

const ItemDetails = styled.div`
  background-color: ${bgColor};
  border-radius: 4px;
  opacity: 0;  
  animation: ${props => props.render ? `${frames} 550ms 1 ease-in-out forwards` : 'none'};
  animation-delay: 100ms;
  box-shadow: ${z.z2};  
  -webkit-backdrop-filter: blur(10px);
  padding: ${containerPadding};
  user-select: none;  
`;

export default(props) => {
  const rarityColor = rarityColorMap[props.item.inventory.tierTypeName.toLowerCase()];
  const damageType = props.item && props.item.instance && damageHashMap[props.item.instance.damageType];
  const damageColor = damageTypeColorMap[damageType];
  const damageIconPath = damageTypeIconMap[damageType];
  const primaryStatType = props.item.instance && props.item.instance.primaryStat && primaryStatHashMap[props.item.instance.primaryStat.statHash];

  function renderStats(stats, item) {
    return stats && <Column justify='start' align='start'>
      <Divider css={`opacity: 0.4;`}/>
      <ItemStats stats={stats} itemStatType={item.primaryStat && primaryStatType}/>
    </Column>
  }

  function renderPerks(perks) {
    return perks && <Column justify='start' align='start'>
      <Divider css={`opacity: 0.4;`}/>      
      <ItemPerks {...{perks}}/>
    </Column>
  }
  return <div {...{style: props.style, className: props.className}} css={`min-width: 325px; max-width: 325px;`}>
    {props.item && <ReactHeight onHeightReady={props.saveDetailHeight}>
      <ItemHeader rarity={rarityColor} render={props.render}>
        <Text white size={2} bold>{props.item.displayProperties.name.toUpperCase()}</Text>
        <Row justify='space-between' css={`margin-top: 4px;`}>
          <Text>{props.item.itemTypeDisplayName}</Text>
          <Text>{props.item.inventory.tierTypeName}</Text>
        </Row>
      </ItemHeader>

      <ItemDetails render={props.render}>
        <Column justify='start' align='start' >
          <ItemDescription item={props.item} {...{damageType, damageColor, damageIconPath, primaryStatType}}/>
        </Column>

        {renderStats(props.stats, props.item)}
        {renderPerks(props.perks)}
      </ItemDetails>
    </ReactHeight>}
  </div>
};