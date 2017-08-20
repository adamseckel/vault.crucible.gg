import React from 'react';
import {FontIcon, IconButton} from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Card} from 'material-ui/Card';
import vaultIcon from './icon_vault.png';
import styled from 'emotion/react';
import {Text, Row, palette} from './styleguide';

const CardContainer = styled(Card)`
  overflow: hidden;
  margin: 10px 0 5px;
`;

const StyledCard = styled(Row)`
  background-size: cover;
  padding: 0 0 0 10px;
  min-width: ${props => !props.vault
  ? '240px'
  : 'none'};
  max-width: ${props => !props.vault
    ? '240px'
    : 'none'};
  height: 50px;
  background-image: ${props => `url(https://www.bungie.net${props.emblem})`};
`;

const Emblem = styled.img `
  width: 34px;
  height: 34px;
  filter: ${props => props.vault
  ? ' invert(100%)'
  : 'none'};
`;

const Container = styled.div `
  text-align: left;
  margin-left: 10px;
  flex-grow: 1;
`;

const CharacterCard = ({vault, character, muiTheme}) => {
  return (
    <CardContainer zDepth={2} data-grow>
      <StyledCard
        vault={vault}
        emblem={character.backgroundPath}
        justify='space-between'>
        <Emblem
          alt='Emblem'
          vault={vault}
          src={vault
          ? vaultIcon
          : `https://www.bungie.net/${character.emblemPath}`}/>
        <Container>
          <Text uppercase white={!vault}>
            {character.characterClass.className}
          </Text>
          <Text white={!vault} size={0} light>{character.race.raceName}</Text>
        </Container>
        <div data-grow style={{
          textAlign: 'right'
        }}>
          <Text uppercase lightLevel>{character.powerLevel}</Text>
          <Text size={0} uppercase light white={!vault}>{character.level}</Text>
        </div>
        <IconButton>
          <FontIcon
            className="material-icons"
            color={vault
            ? muiTheme.palette.textColor
            : muiTheme.palette.alternateTextColor}>arrow_drop_down_circle</FontIcon>
        </IconButton>
      </StyledCard>
    </CardContainer>
  );
};

export default muiThemeable()(CharacterCard);
