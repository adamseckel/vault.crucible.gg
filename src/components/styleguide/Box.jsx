import styled from 'react-emotion';

const justifyMap = {
  start: 'flex-start',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around'
};

const alignMap = {
  start: 'flex-start',
  end: 'flex-end',
  'space-between': 'space-between',
  'space-around': 'space-around',
  stretch: 'stretch'
};

const Box = styled.div `
  display: flex;
  flex-direction: ${props => props.column
  ? 'column'
  : 'row'};
  justify-content: ${props => justifyMap[props.justify] || 'center'};
  align-items: ${props => alignMap[props.align] || 'center'};
  flex-wrap: ${props => props.wrap
      ? 'wrap'
      : ' no-wrap'};
  flex-grow: ${props => props.grow
        ? 1
        : 0};
`;

export const Row = styled(Box)`
  flex-direction: row;
`;

export const Column = styled(Box)`
  flex-direction: column;
`;

export default Box;