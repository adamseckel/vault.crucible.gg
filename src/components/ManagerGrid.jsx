import React, {Component} from 'react';
import styled from 'emotion/react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import LocationsRow from './LocationsRow';
import ItemRow from './ItemRow'
import {Motion, spring} from 'react-motion';
import _ from 'lodash';

const minimizeYSpringSetting = {
  stiffness: 150,
  damping: 15
};

const Grid = styled.div `
  padding: 0px 40px 20px;
  margin-top: 139px;
`;

const [width,
  height,
  cellWidth] = [52, 52, 270];

function calculateLayout(characters, vaultColumns) {
  return characters.concat([{characterId: 'vault'}]).map(({characterId}, index) => {
    const layout = characterId === 'vault'
      ? []
      : [[(index * cellWidth) + 11, 0]];
    const columns = characterId === 'vault'
      ? vaultColumns
      : 3;
    return [characterId, layout.concat(_.range(0, 100).map((n) => {
      const row = Math.floor(n / columns);
      const col = n % columns;
      return [
        (characterId === 'vault'
          ? 0
          : 100) + (index * cellWidth) + 11 + (width * col),
        height * row
      ];
    }))];
  }).reduce((o, [key, val]) => {
    o[key] = val;
    return o;
  }, {});
}

function calculateCharacterLayout(characters) {
  return characters
    .concat([
    {
      characterId: 'vault'
    }
  ])
    .map(({
      characterId
    }, index) => {
      return [
        cellWidth * index,
        0
      ];
    });
}

class ManagerGrid extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: [
        1498876634,
        2465295065,
        953998645,
        4023194814,
        3448274439,
        3551918588,
        14239492,
        20886954,
        1585787867,
        434908299
      ],
      justMinimizedRow: undefined,
      minimizedRows: {},
      hiddenRows: {},
      vault: {
        characterClass: {
          className: 'vault'
        },
        race: {
          raceName: 'Full'
        },
        id: 4567,
        light: '',
        level: ''
      }
    };
  }

  toggleRow = (bucketKey) => {
    this.setState({
      minimizedRows: Object.assign(this.state.minimizedRows, {
        [bucketKey]: !this.state.minimizedRows[bucketKey]
      })
    });
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state)) {
      return false;
    }
    return true;
  }

  renderRows = () => {
    if (!Object.keys(this.props.items).length) 
      return;
    let rowOffset = 0
    const itemLayout = calculateLayout(this.props.characters, this.props.vaultColumns);
    const characterLayout = calculateCharacterLayout(this.props.characters);
    return this.state.rows.map((bucketKey) => {
        let rowStyle = {
          translateY: spring(rowOffset, minimizeYSpringSetting)
        }
        rowOffset += this.state.minimizedRows[bucketKey]
          ? 40
          : this.props.items[bucketKey].rowHeight + 30;
        return (
          <Motion style={rowStyle} key={bucketKey}>
            {({translateY}) => <ItemRow
              key={bucketKey}
              query={this.props.query}
              bucketKey={bucketKey}
              characters={this.props.characters}
              items={this.props.items[bucketKey].items}
              title={this.props.items[bucketKey].name}
              height={this.props.items[bucketKey].rowHeight}
              minimize={this.toggleRow}
              layout={itemLayout}
              moveItem={this.props.moveItem}
              equipItem={this.props.equipItem}
              characterLayout={characterLayout}
              render={this.state.hiddenRows[bucketKey]}
              vaultColumns={this.props.vaultColumns}
              clientWidth={this.props.clientWidth}/>
}
          </Motion>
        );
      });
  }

  render() {
    return (
      <Grid>
        <LocationsRow characters={this.props.characters} vault={this.state.vault} /> {this.renderRows()}
      </Grid>
    );
  }
}

export default muiThemeable()(ManagerGrid);
