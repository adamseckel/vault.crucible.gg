import React, {Component} from 'react';
import _ from 'lodash';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {Row} from './styleguide';
import Cell from './Cell';
import InventoryBucket from './InventoryBucket';
import Header from './Header';
import VisibilitySensor from 'react-visibility-sensor';
import styled from 'emotion/react';

const StyledRow = styled(Row)`
  position: relative;
  background-color: white;
  margin: -5px 0;
  transition: opacity, min-height .5s ease;
`;

const [width, height] = [52, 52];

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

function flattenItems(items) {
  return Object.keys(items).map((characterID) => {
    return items[characterID];
  }).reduce((a, b) => {
    return a.concat((Array.isArray(b)
      ? b
      : []));
  }).map((item) => {
    return [item.itemInstanceId, item];
  }).reduce((o, [key, val]) => {
    o[key] = val;
    return o;
  }, {});
}

function order(items) {
  return Object
    .keys(items)
    .map((characterID) => {
      return items[characterID].map((item) => {
        return {
          characterID,
          id: item.itemInstanceId,
          name: item.displayProperties.name,
          equippable: item.equippable,
          quality: item.inventory && item.inventory.tierTypeName && item.inventory.tierTypeName.toLowerCase(),
          nonTransferrable: item.inventory.nonTransferrableOriginal,
          equipped: item.transferStatus,
          itemTypeName: item.itemTypeDisplayName
        }
      }).sort((a, b) => {
        return a.equipped < b.equipped;
      });
    })
    .reduce((a, b) => {
      return a.concat(b);
    }, []);
}

function reinsert(order, newCharacterID, from, to) {
  const _arr = order.slice(0);
  const val = order[from];
  val.characterID = newCharacterID;
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

class ItemRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minimized: false,
      rendered: true,
      mouseXY: [
        0, 0
      ],
      mouseCircleDelta: [
        0, 0
      ], // difference between mouse and circle pos for x + y coords, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      error: false,
      errorMessage: '',
      order: order(this.props.items),
      items: flattenItems(this.props.items),
    };
  }

  handleTouchStart = (key, characterID, lastItem, index, [
    pressX, pressY
  ], e) => {
    this.handleMouseDown(key, characterID, lastItem, index, [
      pressX, pressY
    ], e.touches[0]);
  }

  handleTouchMove = (e) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  }

  // shouldComponentUpdate = (nextProps, nextState) => {
  //   if (_.isEqual(nextProps, this.props)) {
  //     console.log('dont update')
  //     return false;
  //   }
  //   console.log(true)
  //   return true;
  // }

  handleMouseMove = ({pageX, pageY}) => {
    const {
      order,
      lastItem,
      lastPress,
      isPressed,
      mouseCircleDelta: [dx, dy]
    } = this.state;
    if (isPressed) {
      let error;
      const mouseXY = [
        pageX - dx,
        pageY - dy
      ];
      const goal = mouseXY[0];
      const column = this
        .props
        .characterLayout
        .reduce((prev, curr) => {
          return curr[0] > goal ? prev : (prev[0] < curr[0] ? curr : prev);
        }, [-Infinity]);

      const characterIndex = this
        .props
        .characterLayout
        .indexOf(column);

      const characterID = this.props.characters[Object.keys(this.props.characters)[characterIndex]]
        ? this.props.characters[Object.keys(this.props.characters)[characterIndex]].characterId
        : 'vault';

      const proposedDestinationItemCount = order.filter((item) => {
        return item.characterID === characterID;
      }).filter((item) => {
        return item.id !== lastPress;
      }).length;

      if (characterID === 'vault' ? proposedDestinationItemCount > 100 : proposedDestinationItemCount > 9) {
        return this.setState(Object.assign({mouseXY}));
      }

      const col = clamp(Math.floor(mouseXY[0] / width), 0, (Object.keys(this.props.characters).length * 4 + this.props.vaultColumns));
      const row = clamp(Math.floor(mouseXY[1] / height), 0, Math.floor(this.state.order.length / (Object.keys(this.props.characters).length * 4 + this.props.vaultColumns)));
      let index = row * (Object.keys(this.props.characters).length * 4 + this.props.vaultColumns) + col;

      let newOrder = true;
      let proposedOrder = reinsert(order, characterID, order.indexOf(lastItem), index);

      const update = {
        mouseXY,
        error: !!error,
        errorMessage: error
      }

      if (newOrder) {
        update.order = proposedOrder;
        update.lastCharacter = characterID;
      }

      this.setState(update);
    }
  }

  handleMouseDown = (key, characterID, lastItem, index, [pressX, pressY], {pageX, pageY}) => {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);

    this.props.handleItemMouseLeave();
    this.props.stopInventoryPolling();

    this.setState({
      lastPress: key,
      initialCharacter: characterID,
      lastCharacter: characterID,
      lastItemIndex: index,
      lastItem,
      lastOrder: this.state.order.slice(0),
      isPressed: true,
      mouseCircleDelta: [
        pageX - pressX,
        pageY - pressY
      ],
      mouseXY: [pressX, pressY]
    });
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.state.isPressed) return;
    if (_.isEqual(nextProps, this.props)) {
      return false;
    }
    this.setState({
      order: order(nextProps.items),
      items: flattenItems(nextProps.items)
    });
  } 

  handleMouseUp = () => {
    this.setState({
      isPressed: false,
      mouseCircleDelta: [0, 0]
    });

    this.props.startInventoryPolling();

    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);

    if (!this.state.lastItem || this.state.lastItemIndex === undefined) return;
    const {itemInstanceId, itemHash} = this.state.items[this.state.lastItem.id];
    console.log( this.state.items[this.state.lastItem.id])

    const shouldEquip = this.state.order.filter((item) => {
      return item.characterID === this.state.lastCharacter;
    }).indexOf(this.state.lastItem) === 0;

    const shouldUnequip = this.state.lastOrder.filter((item) => {
      return item.characterID === this.state.lastCharacter;
    }).indexOf(this.state.lastItem) === 0;
    
    if (!shouldEquip && !shouldUnequip && this.state.lastCharacter === this.state.initialCharacter) {
      return;
    }

    const shouldUnequipReplacementItem = shouldUnequip && this.state.lastOrder.filter((item) => {
      return item.characterID === this.state.lastCharacter;
    })[1];

    const shouldUnequipReplacementItemID = shouldUnequipReplacementItem ? shouldUnequipReplacementItem.id : false;

    return this.props.moveItem(itemHash.toString(), itemInstanceId, this.state.lastCharacter, this.state.initialCharacter, shouldEquip, shouldUnequipReplacementItemID)
      .catch((error) => {
        console.log('catch?', error.message)
        const {order, lastOrder, initialCharacter, lastItem} = this.state;

        this.setState({
          order: reinsert(order, initialCharacter, order.indexOf(lastItem), lastOrder.indexOf(lastItem))
        });
      });
  }

  returnQuery(itemDef, query) {
    return ['common', 'rare', 'legendary', 'exotic'].indexOf(query) >= 0
      ? itemDef
        .tierTypeName
        .toLowerCase()
        .indexOf(query) >= 0
      : itemDef
        .itemName
        .toLowerCase()
        .indexOf(query) >= 0 || itemDef
        .itemTypeName
        .toLowerCase()
        .indexOf(query) >= 0;
  }

  onMinimize = () => {
    this
      .props
      .minimize(this.props.bucketKey)

    this.setState({
      minimized: !this.state.minimized,
      rendered: !this.state.rendered
    });
  }

  renderBucket(items, characterId, layout, order, query) {
    const {bucketKey} = this.props.bucketKey;
    return (
      <div
        css={`margin-right: -10px;`}
        data-flex
        data-row
        data-layout="space-between start">
        <InventoryBucket
          {...{ characterId, layout, order, items, query, bucketKey}}
          mouseCircleDelta={this.state.mouseCircleDelta}
          handleMouseUp={this.handleMouseUp}
          handleMouseDown={this.handleMouseDown}
          handleTouchStart={this.handleTouchStart}
          handleItemHover={this.props.handleItemHover}
          handleItemMouseLeave={this.props.handleItemMouseLeave}
          lastPress={this.state.lastPress}
          isPressed={this.state.isPressed}
          mouseXY={this.state.mouseXY}/>
      </div>
    );
  }

  renderCells() {
    return Object.keys(this.props.characters).concat(['vault']).map((characterId) => {
      return (
        <Cell key={characterId} vault={characterId === 'vault'}>
          {this.renderBucket(this.state.items, characterId, this.props.layout[characterId], this.state.order, this.props.query)}
        </Cell>
      )
    });
  }

  renderRow(visible) {
    return this.state.rendered && visible
      ? this.renderCells()
      : <div></div>;
  }

  onFadedOut = () => {
    if (this.state.minimized) {
      this.setState({rendered: false});
    }
  }

  toggleRender = (render) => {
    this.setState({minimized: render});
  }

  render() {
    return (
      <VisibilitySensor
        partialVisibility={true}
        offset={{
        top: -200,
        bottom: -200
      }}
        delayedCall={true}>
        {({isVisible}) => <div
          key={this.props.title}
          style={Object.assign(this.props.style || {}, {
          marginRight: '10px',
          zIndex: '1'
        })}
          data-flex
          data-column>
          <Header
            key={this.props.title}
            title={this.props.title}
            minimized={this.state.minimized}
            onMinimize={this.onMinimize}/> {this.state.rendered || !this.state.minimized
            ? <StyledRow
                justify='start'
                align='stretch'
                grow
                style={{
                minHeight: `${this.props.height}px`,
                opacity: `${isVisible
                  ? 1
                  : 0}`
              }}>
                {this.renderRow(isVisible)}
              </StyledRow>
            : <div></div>
            }
        </div>
        }
      </VisibilitySensor>
    );
  }
}

export default muiThemeable()(ItemRow);
