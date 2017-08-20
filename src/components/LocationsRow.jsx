import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import styled from 'emotion/react';
import {Row} from './styleguide';
import CharacterCard from './CharacterCard';
import Cell from './Cell';
import {fade} from 'material-ui/utils/colorManipulator';




const StyledRow = styled(Row)`
  margin: -5px 0;
`;

const Header = ({characters = [], vault, muiTheme}) => {
  const RowContainer = styled.div `
    position: fixed;
    left: 0;
    right: 0;
    height: 80px;
    padding: 0 40px;
    top: 65px;
    background-color: ${muiTheme.palette.canvasColor};
    -webkit-backdrop-filter: blur(10px);
    z-index: 300;
  `;

  function renderRows(characters) {
    return Object.keys(characters).map((characterID) => <Cell key={characters[characterID].characterId}>
      <CharacterCard character={characters[characterID]}/>
    </Cell>);
  }

  return (
    <RowContainer>
      <StyledRow justify='start' align='stretch'>

        {renderRows(characters)}

        <Cell key={'vault'} vault={true} data-grow>
          <CharacterCard vault='true' character={vault}/>
        </Cell>
      </StyledRow>
    </RowContainer>
  );
}

export default muiThemeable()(Header);
