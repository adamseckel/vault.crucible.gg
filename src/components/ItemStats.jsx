import React from 'react';
import styled from 'emotion/react';
import {palette} from './styleguide';
import {Row, Text} from './styleguide';
import {fade} from 'material-ui/utils/colorManipulator';

const StatRow = styled(Row)`
  margin-bottom: 2px;
  width: 100%;
  &:last-child {
    margin: 0;
  }
`;

const StatIcon = styled.img`
  width: 20px;
  filter: invert(100%);
  margin-right: 8px;
  opacity: .6;
`;

const StatLabel = styled(Text)`
  max-width: 80px;
  min-width: 80px;
  margin-right: 8px;
`;

const BarBackground = styled(Row)`
  background-color: ${fade(palette.stroke, .8)};
  height: 20px;
  position: relative;
  padding: 4px;
  width: 208px;
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
  background-color: ${fade(palette.secondaryText, .8)};
  width: ${props => `${props.width * 100}%`};
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
`;

export default(props) => {
  function mapStats(stats) {
    return stats.map((stat) => 
      props.itemStatType === 'ATTACK'
        ? <StatRow layout='start' key={stat.statName}>
          <StatLabel right gray>{stat.statName}</StatLabel>
          {stat.statName !== 'Magazine'
            ? <BarBackground grow justify='start'>
                <StatValueLabel white>{stat.value}</StatValueLabel>
                <BarFill width={stat.value / stat.maximumValue}></BarFill>
              </BarBackground>
            : <Row grow justify='start' css={`height: 28px;`}>
              <StatLabel css={`color: ${palette.secondaryText} !important;`}> {stat.value} </StatLabel>
            </Row>
          }
        </StatRow>
        : stat.value > 0 
          ? <StatRow layout='start'>
            <StatIcon src={`https://bungie.net${stat.icon}`}/>
            <StatLabel css={`color: ${palette.secondaryText} !important;`}>{stat.statName}</StatLabel>
            <Row grow justify='start' css={`height: 28px;`}>
                <StatLabel css={`color: ${palette.secondaryText} !important;`}> +{stat.value} </StatLabel>
              </Row>
          </StatRow>
          : ''
    );
  }

  return <div {...props}>
    {props.stats ? mapStats(props.stats) : ''}
  </div>
};