import React, {Component} from 'react';
import styled from 'emotion/react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {ItemDetail, InventoryRow} from './index';
import {Column} from './styleguide';
import {Motion, spring} from 'react-motion';
import _ from 'lodash';

const minimizeYSpringSetting = {
  stiffness: 150,
  damping: 15
};

const bucketHashOrder = [
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
]

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
    const [width, height] = this.props.clientXY;
    const {pageX, pageY, screenX, screenY} = e;
    const offsetY = height - screenY + 95 - this.state.detailHeight;
    const optimalY = (pageY - 130 + this.state.detailHeight - 30);

    const x = width - 400 < pageX ? pageX - 380 : pageX;
    const y = offsetY > 0 ? optimalY : optimalY + offsetY;

    this.setState({
      mouseXY: [x, y]
    });
  }

  handleItemMouseLeave = () => {
    this.setState({
      hoveredItemID: undefined,
      hoveredItem: undefined,
      previouslyHoveredItemID: this.state.hoveredItemID
    });
    this.startInventoryPolling();

    window.removeEventListener('mousemove', this.onHover);
  }

  handleItemHover = (hoveredItemID, characterID, hoveredItem) => {    
    window.addEventListener('mousemove', this.onHover)
    this.stopInventoryPolling();

    const isLastItem = hoveredItemID === this.state.previouslyHoveredItemID;

    this.setState({
      hoveredItemID: undefined,
      hoveredItem: undefined,
      hoveredItemDetails: isLastItem ? this.state.hoveredItemDetails : {}
    });

    if (isLastItem) {
      setImmediate(() => {
        this.setState({
          hoveredItemID,
          hoveredItem
        });
      });

      return;
    };

    this.props.getItemDetail(characterID, hoveredItemID).then(({data, definitions}) => {
      const item = data.item;
      
      const stats = item.stats.length ? item.stats.map((stat) => {
        return Object.assign(stat, definitions.stats[stat.statHash]);
      }) : undefined;

      const perks = item.perks.length ? item.perks.map((perk) => {
        return Object.assign(perk, definitions.perks[perk.perkHash])
      }) : undefined;

      this.setState({
        hoveredItemID,
        hoveredItem,
        hoveredItemDetails: {
          stats,
          perks
        }
      });
    }).catch((error) => {
      // Currently Vault does not allow item Details. Fixed in D2.
      console.log(error.message)
    });
  }

  saveDetailHeight = (detailHeight) => {
    this.setState({
      detailHeight
    });
  }

  renderRows = () => {
    if (!Object.keys(this.props.items).length) return;
    let rowOffset = 0
    const layout = calculateLayout(this.props.characters, this.props.vaultColumns);
    const characterLayout = calculateCharacterLayout(this.props.characters);

    const {handleItemHover, handleItemMouseLeave} = this;
    return this.state.rows.map((bucketKey) => {
        let rowStyle = {
          translateY: spring(rowOffset, minimizeYSpringSetting)
        }
        rowOffset += this.state.minimizedRows[bucketKey]
          ? 40
          : this.props.items[bucketKey].rowHeight + 30;
        return (
          <Motion style={rowStyle} key={bucketKey}>
            {({translateY}) => 
              <InventoryRow {...{bucketKey, layout, characterLayout, handleItemHover, handleItemMouseLeave}}
                key={bucketKey}
                query={this.props.query}
                characters={this.props.characters}
                items={this.props.items[bucketKey].items}
                title={this.props.items[bucketKey].name}
                height={this.props.items[bucketKey].rowHeight}
                minimize={this.toggleRow}
                moveItem={this.props.moveItem}
                render={this.state.hiddenRows[bucketKey]}
                vaultColumns={this.props.vaultColumns}
                stopInventoryPolling={this.stopInventoryPolling}
                startInventoryPolling={this.startInventoryPolling}
                clientWidth={this.props.clientWidth}/>
            }
          </Motion>
        );
      });
  }

  render() {
    return (
      <Grid>
          {this.state.hoveredItemID
            ? <Column align='end' justify='end' css={`position: absolute; z-index: 2000;`} style={{transform: `translate3d(${this.state.mouseXY[0]}px, ${this.state.mouseXY[1]}px, 0)`, overflow: 'visible', height: '1px',}}>
                <ItemDetail 
                  item={this.state.hoveredItem}
                  saveDetailHeight={this.saveDetailHeight}
                  stats={this.state.hoveredItemDetails.stats}
                  perks={this.state.hoveredItemDetails.perks}/>
              </Column>
            : undefined
          }
        {this.renderRows()}
        <div></div>
      </Grid>
    );
  }
}

export default muiThemeable()(InventoryGrid);
