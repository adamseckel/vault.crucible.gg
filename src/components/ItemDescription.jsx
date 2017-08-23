import React from 'react';
import styled from 'emotion/react';
import {Row, Text} from './styleguide';

const DamageIcon = styled.img`
  width: 40px;
  filter: ${props => props.black ? 'invert(100%)' : 'none'};
  margin-right: 4px;
`;

export default(props) => {
  return <div>
    <Row justify='start' css={`margin-bottom: 8px`}>
      {props.damageIconPath ? <DamageIcon src={`https://bungie.net${props.damageIconPath}`} black={props.damageType === 'damage-kinetic'}/> : ''}
      <Text css={`color: ${props.damageColor} !important;`} bold size={4}>{props.item.primaryStat ? props.item.primaryStat.value : 0}</Text>
      <Text css={`color: ${props.damageColor} !important; margin-left: 8px;`}>{props.item.primaryStat ? props.primaryStatType : ''}</Text>
    </Row>
    <Text gray italic> {props.item.definition.itemDescription} </Text>
  </div>
};