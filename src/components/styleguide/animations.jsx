import { keyframes, css } from 'emotion';

const fadeInKeyframes = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeIn = css`
  animation: ${fadeInKeyframes} 500ms ease 1 forwards;
`;

const fadeInSlow = css`
  animation: ${fadeInKeyframes} 1000ms ease 1 forwards;
`;

export default {
  fadeIn,
  fadeInSlow,
};
