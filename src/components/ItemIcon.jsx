import React from 'react';
import styled from 'emotion/react';
import {palette} from './styleguide';
import {css} from 'emotion';

const itemStyle = css`
  width: 45px;
  height: 45px;
  border-radius: 4px;
  background-size: cover;
  user-select: none;
  border: 2px solid ${palette.stroke};
  position: relative;
`;

const statStyle = css`
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(255,255,255,0.5);
  font-size: 10px;
  padding: 0 2px;
  border-radius: 2px;
  margin: 1px;
  font-weight: 500;
`;

export default(props) => {
  return props.item && props.item.definition.icon
    ? <div className={itemStyle}
        style={{
          backgroundImage: `url(https://bungie.net/${props.item.definition.icon})`,
          borderColor: `${props.item.isGridComplete ? palette.lightLevel : palette.stroke}`,
        }}>
        <span css={statStyle}>
          {props.item.primaryStat ? props.item.primaryStat.value : ''}
        </span>
      </div>
    : '';
};