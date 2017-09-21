import React from 'react';
import styled from 'emotion/react';
import {palette} from './styleguide';
import {Row, Text} from './styleguide';
import {fade} from 'material-ui/utils/colorManipulator';
import _ from 'lodash';

const magazineStatHash = '3871231066';
const numericStatHashes = [4284893193, 3871231066];

const StatRow = styled(Row)`
  margin-bottom: 2px;
  width: 100%;
  &:last-child {
    margin: 0;
  }
`;

const StatLabel = styled(Text)`
  max-width: 100px;
  min-width: 100px;
  margin-right: 8px;
`;

const BarBackground = styled(Row)`
  background-color: ${fade(palette.secondaryText, .2)};
  height: 16px;
  position: relative;
  padding: 4px;
  width: 185px;
  border-radius: 4px;
  overflow: hidden;
`;

const StatValueLabel = styled(Text)`
  position: relative;
  z-index: 2;
`;

const BarFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
  background-color: ${fade(palette.stroke, .1)};
  width: ${props => `${props.width * 100}%`};
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
`;

export default(props) => {
  function renderStat(item, stat, definitions) {
    return (
      <StatRow layout='start' key={stat.statHash}>
        <StatLabel right size='0' gray>{definitions[stat.statHash].displayProperties.name}</StatLabel>
        {!numericStatHashes.includes(stat.statHash)
          ? <BarBackground grow justify='start'>
              <StatValueLabel size='0' gray>{stat.value}</StatValueLabel>
              <BarFill width={stat.value / stat.maximumValue}></BarFill>
            </BarBackground>
          : <Row grow justify='start' css={`height: 18px;`}>
            <StatLabel size='0' gray> {stat.value} </StatLabel>
          </Row>
        }
      </StatRow>
    );
  }

  function mapStats(item, definitions) {
    const hasMagazine = Object.keys(item.stats).includes(magazineStatHash);
    return _.sortBy(Object.keys(item.stats), (statHash) => definitions[statHash].index)
      .filter((statHash) => statHash !== magazineStatHash)
      .concat(hasMagazine ? [magazineStatHash] : [])
      .map((statHash) => renderStat(item, item.stats[statHash], definitions));
  }

  return <div {...{className: props.className, style: props.style}}>
    {mapStats(props.item, props.statsDefinitions)}
  </div>
};