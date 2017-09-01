import React from 'react';
import Card from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import vaultIcon from './icon_vault.png';
import styled from 'emotion/react';
import {Text, Row, palette, animations} from './styleguide';

const CardContainer = styled(Card)`
  composes: ${animations.fadeIn};
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

const raceHashMap = {
  3887404748: 'Human',
  2803282938: 'Awoken',
  full: 'Full'
};

const classHashMap = {
  671679327: 'Hunter',
  2271682572: 'Warlock',
  3655393761: 'Titan',
  vault: 'Vault'
};

const defaultCharacter = {
  backgroundPath: undefined,
  emblemPath: undefined,
  characterLevel: undefined,
  characterBase: {
    classHash: undefined,
    raceHash: undefined,
    powerLevel: undefined
  }
};

export default({vault, character = defaultCharacter}) => {
  return (
    <CardContainer zDepth={2} data-grow>
      <StyledCard
        vault={vault}
        emblem={character.backgroundPath}
        justify='space-between'>
        {(character.emblemPath || vault ) ? <Emblem vault={vault} src={vault ? vaultIcon : `https://www.bungie.net${character.emblemPath}`}/> : undefined}
        <Container>
          <Text uppercase white={!vault}>
            {classHashMap[character.characterBase.classHash]}
          </Text>
          <Text white={!vault} size={0} light>{raceHashMap[character.characterBase.raceHash]}</Text>
        </Container>
        <div data-grow style={{
          textAlign: 'right'
        }}>
          <Text uppercase lightLevel>{character.characterBase.powerLevel}</Text>
          <Text size={0} uppercase light white={!vault}>{character.characterLevel}</Text>
        </div>
        <IconButton>
          <FontIcon
            className="material-icons"
            color={vault
            ? palette.darkText
            : palette.lightText}>arrow_drop_down_circle</FontIcon>
        </IconButton>
      </StyledCard>
    </CardContainer>
  );
};