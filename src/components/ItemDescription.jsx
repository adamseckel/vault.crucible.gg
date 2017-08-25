import React from 'react';
import styled from 'emotion/react';
import {Row, Text, palette} from './styleguide';

const DamageIcon = styled.img`
  width: 40px;
  margin-right: 4px;
`;

export default(props) => {
  const color = props.primaryStatType === 'ATTACK' ? props.damageColor : palette.whiteText;
  return <div>
    {(props.item.primaryStat && props.item.primaryStat.value > 0)
      ? <Row justify='start' css={`margin-bottom: 8px`}>
        {props.damageIconPath ? <DamageIcon src={`https://bungie.net${props.damageIconPath}`}/> : ''}
        <Text css={`color: ${color} !important;`} bold size={4}>{props.item.primaryStat ? props.item.primaryStat.value : 0}</Text>
        <Text css={`color: ${color} !important; margin-left: 8px;`}>{props.item.primaryStat ? props.primaryStatType : ''}</Text>
      </Row>
      : ''
    }
    <Text gray italic> {props.item.definition.itemDescription} </Text>
  </div>
};