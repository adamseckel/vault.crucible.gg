import React from 'react';
import styled from 'emotion/react';
import {palette, z} from './styleguide';
import {keyframes} from 'emotion';
import {Row, Column, Text} from './styleguide';
import {ItemStats, ItemPerks, ItemDescription} from './index';
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
  'damage-kinetic': palette.background,
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

const ItemDetails = styled.div `
  width: 325px;
`;

const ItemHeader = styled.div`
  background-color: ${props => fade(props.rarity, .95)};
  padding: ${containerPadding};
  border-radius: 4px;
  margin-bottom: 2px;
  animation: ${frames} 350ms 1 ease;
  box-shadow: ${z.z2};
  -webkit-backdrop-filter: blur(10px);
`;

const bgColor = fade(palette.darkText, 0.95);

const ItemSection = styled(Column)`
  padding: ${containerPadding};
  background-color: ${bgColor};
  border-radius: 4px;
  animation: ${frames} 650ms 1 ease;
  margin-bottom: 2px;
  box-shadow: ${z.z2};
  -webkit-backdrop-filter: blur(10px);
`;

export default(props) => {
  const rarityColor = rarityColorMap[props.item.definition.tierTypeName.toLowerCase()];
  const damageType = damageHashMap[props.item.damageTypeHash]
  const damageColor = damageTypeColorMap[damageType];
  const damageIconPath = damageTypeIconMap[damageType];
  const primaryStatType = props.item.primaryStat ? primaryStatHashMap[props.item.primaryStat.statHash] : undefined;

  function renderStats(stats, item) {
    return stats
      ? <ItemSection justify='start' align='start'>
        <ItemStats stats={stats} itemStatType={item.primaryStat ? primaryStatType : ''}/>
      </ItemSection>
      : '';
  }

  function renderPerks(perks) {
    return perks
      ? <ItemSection justify='start' align='start'>
        <ItemPerks {...{perks}}/>
      </ItemSection>
      : '';
  }

  return <div css={`position: absolute; z-index: 1000;`} {...props}>
    {props.item 
      ? <ItemDetails>
          <ItemHeader rarity={rarityColor}>
            <Text white size={2} bold>{props.item.definition.itemName.toUpperCase()}</Text>
            <Row justify='space-between' css={`margin-top: 4px;`}>
              <Text>{props.item.definition.itemTypeName}</Text>
              <Text>{props.item.definition.tierTypeName}</Text>
            </Row>
          </ItemHeader>

          <ItemSection justify='start' align='start'>
            <ItemDescription item={props.item} {...{damageType, damageColor, damageIconPath, primaryStatType}}/>
          </ItemSection>

          {renderStats(props.stats, props.item)}
          {renderPerks(props.perks)}
        </ItemDetails>
      : ''
    }
  </div>
};