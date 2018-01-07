import React from 'react';
import { palette, Row } from './styleguide';
import { css } from 'emotion';
import FontIcon from 'material-ui/FontIcon';

const itemStyle = css`
  width: 45px;
  height: 45px;
  border-radius: 4px;
  background-size: cover;
  user-select: none;
  border: 2px solid ${palette.stroke};
  position: relative;
  background-color: ${palette.background};
`;

const statStyle = css`
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  padding: 0 2px;
  border-radius: 2px;
  margin: 1px;
  font-weight: 500;
`;

export default props => {
  if (!props.item) return;
  return (
    <Row
      className={itemStyle}
      style={{
        backgroundImage: `url(https://bungie.net${props.item.displayProperties.icon})`,
      }}
    >
      {props.item.instance &&
        props.item.instance.primaryStat &&
        props.item.instance.primaryStat.value && (
          <span css={statStyle}>{props.item.instance.primaryStat.value || 0}</span>
        )}
      {props.item.redacted && (
        <FontIcon className="material-icons" color={palette.stroke}>
          {' '}
          lock{' '}
        </FontIcon>
      )}
    </Row>
  );
};
