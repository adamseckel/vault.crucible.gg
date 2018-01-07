import React from 'react';
import { Row } from './styleguide';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import twitterSvg from './twitter.svg';

export default props => {
  function tweet() {
    return window.open(
      'https://twitter.com/intent/tweet?text=@hemlok&hashtags=cruciblegg',
      '_blank',
    );
  }

  return (
    <FloatingActionButton
      secondary
      css={`
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
      `}
    >
      <Row>
        <img
          css={`
            width: 20px;
          `}
          src={twitterSvg}
          alt="Tweet Me"
          onTouchTap={tweet}
        />
      </Row>
    </FloatingActionButton>
  );
};
