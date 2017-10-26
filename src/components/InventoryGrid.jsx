import React, {Component} from 'react';
import styled from 'react-emotion';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {ItemDetail, InventoryRow} from './index';
import {Column} from './styleguide';
import _ from 'lodash';

// const otherBuckets = [284967655,  1269569095,   2025709351,  2973005342, 3054419239, 3313201758,  4274335291];

const bucketHashOrder = [1498876634, 2465295065, 953998645, 4023194814, 3448274439, 3551918588, 14239492, 20886954, 1585787867];

const Grid = styled.div `
  padding: 0px 40px 20px;
  margin-top: 139px;
`;

const [width, height, cellWidth] = [52, 52, 270];

function calculateLayout(characters, vaultColumns) {
  return Object.keys(characters).concat(['vault']).map((characterId, index) => {
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

function calculateMouseXY(e, clientXY, cardHeight) {
  const [width, height] = clientXY;
  const {pageX, pageY, screenY} = e;
  const offsetY = height - screenY + 75 - cardHeight;
  const optimalY = (pageY - 130 + cardHeight - 30);

  const x = width - 400 < pageX ? pageX - 380 : pageX;
  const y = offsetY > 0 ? optimalY : optimalY + offsetY;

  return [x, y];
}

function calculateCharacterLayout(characters) {
  return Object.keys(characters)
    .concat(['vault'])
    .map((characterId, index) => {
      return [cellWidth * index, 0];
    });
}

class InventoryGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: bucketHashOrder,
      justMinimizedRow: undefined,
      minimizedRows: {},
      hiddenRows: {},
      hoveredItemDetails: {}
    };
  }

  componentDidMount = () => {
    this.startInventoryPolling();
  }

  startInventoryPolling = () => {
    this.props.startInventoryPolling();
  }

  stopInventoryPolling = () => {
    this.props.stopInventoryPolling();
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

  onHover = (e) => {
    this.setState({
      mouseXY: calculateMouseXY(e, this.props.clientXY, this.state.detailHeight)
    });
  }

  handleItemMouseLeave = () => {
    this.setState({
      hoveredItemID: undefined,
      hoveredItem: undefined,
      detailHeight: undefined,
    });
    this.startInventoryPolling();

    window.removeEventListener('mousemove', this.onHover);
  }

  handleItemHover = (hoveredItemID, characterID, hoveredItem, e) => {    
    window.addEventListener('mousemove', this.onHover)
    this.stopInventoryPolling();
    const {pageX, pageY, screenY} = e;
    
    this.setState({
      hoveredItemID: undefined,
      hoveredItem: undefined,
      lastEvent: {
        pageX,
        pageY,
        screenY
      }
    });

    setImmediate(() => {
      this.setState({
        hoveredItemID,
        hoveredItem
      });
    });
  }

  saveDetailHeight = (detailHeight) => {
    this.setState({
      detailHeight,
      mouseXY: calculateMouseXY(this.state.lastEvent, this.props.clientXY, detailHeight)
    });
  }

  renderRows = () => {
    if (!this.props.items || !Object.keys(this.props.items).length) return;
    const layout = calculateLayout(this.props.characters, this.props.vaultColumns);
    const characterLayout = calculateCharacterLayout(this.props.characters);
    
    return this.state.rows.map((bucketKey) => 
      this.props.items[bucketKey] && <InventoryRow
        key={bucketKey}
        query={this.props.query}
        characters={this.props.characters}
        bucketKey={bucketKey}
        layout={layout}
        characterLayout={characterLayout}
        items={this.props.items[bucketKey].items}
        title={this.props.items[bucketKey].name}
        height={this.props.items[bucketKey].rowHeight}
        minimize={this.toggleRow}
        moveItem={this.props.moveItem}
        render={this.state.hiddenRows[bucketKey]}
        vaultColumns={this.props.vaultColumns}
        stopInventoryPolling={this.stopInventoryPolling}
        startInventoryPolling={this.startInventoryPolling}
        handleItemHover={this.handleItemHover}
        handleItemMouseLeave={this.handleItemMouseLeave}
        clientWidth={this.props.clientWidth}/>
    );
  }

  render() {
    return (
      <Grid>
        {this.state.hoveredItemID && <Column align='end' justify='end' css={`position: absolute; z-index: 2000; overflow: visible; height: 1px;`}
          style={{
            transform: `translate3d(${this.state.mouseXY[0]}px, ${this.state.mouseXY[1]}px, 0)`
          }}>
            <ItemDetail 
              item={this.state.hoveredItem}
              saveDetailHeight={this.saveDetailHeight}
              statsDefinitions={this.props.statsDefinitions}
              perksDefinitions={this.props.perksDefinitions}
              render={this.state.detailHeight ? true : false}/>
        </Column>}
        {this.renderRows()}
        <div></div>
      </Grid>
    );
  }
}

export default muiThemeable()(InventoryGrid);
