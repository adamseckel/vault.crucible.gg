import React from 'react';
import { palette, Row } from './styleguide';
import styled from 'react-emotion';
import { Motion, spring } from 'react-motion';

const height = 56;

const Snackbar = styled(Row)`
  background-color: ${palette.snack};
  color: ${palette.lightText};
  border-radius: 4px;
  padding: 6px 24px;
  min-width: 250px;
  font-size: 14px;
  text-align: left;
  height: 36px;
  position: absolute;
  bottom: 0;
  box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14),
    0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  -webkit-backdrop-filter: blur(10px);
  user-select: none;
`;

export default ({ messages = [], className }) => {
  function calculateSnackStyle(i, rendered) {
    return {
      opacity: rendered ? spring(1) : spring(0),
      y: spring(i * -height + (rendered ? 0 : height)),
    };
  }

  return (
    <div className={className}>
      {Object.keys(messages)
        .sort((a, b) => b - a)
        .map((key, i) => {
          const snackStyle = calculateSnackStyle(i, messages[key].rendered);
          return (
            <Motion style={snackStyle} key={key}>
              {({ opacity, y }) => (
                <Snackbar
                  justify="start"
                  key={key}
                  type={messages[key].type}
                  style={{
                    transform: `translate3d(0, ${y}px, 0)`,
                    opacity,
                    zIndex: 10 - i,
                  }}
                >
                  {' '}
                  {messages[key].message}{' '}
                </Snackbar>
              )}
            </Motion>
          );
        })}
    </div>
  );
};
