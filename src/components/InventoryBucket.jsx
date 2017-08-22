import React, {Component} from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {InventoryItem} from './index';
import {Motion, spring} from 'react-motion';
import _ from 'underscore';
import styled from 'emotion/react';

const Bucket = styled.div `
  min-width: ${props => props.vault
  ? 'none'
  : '160px'};
  max-width: ${props => props.vault
    ? 'none'
    : '160px'};
`;

const ItemContainer = styled.div `
  position: absolute;
  left: 0;
  userSelect: none;
  margin: 0 5px 5px 0;
  borderRadius: 4px;
`;

const springSetting1 = {
  stiffness: 180,
  damping: 10
};
const springSetting2 = {
  stiffness: 200,
  damping: 17
};

class InventoryBucket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: this.props.vault
        ? Math.floor(547 / 54)
        : 3
    };
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (_.isEqual(nextProps, this.props) && _.isEqual(nextState, this.state)) {
      return false;
    }
    return true;
  }

  componentDidMount = () => {
    this.setState({
      columns: this.props.characterId === 'vault'
        ? Math.floor(547 / 54)
        : 3
    });
  }

  returnQuery(item, query) {
    if (!query || query === '') {
      return true;
    }
    return ['common', 'rare', 'legendary', 'exotic'].indexOf(query) >= 0
      ? item
        .quality
        .toLowerCase()
        .indexOf(query.toLowerCase()) >= 0
      : item
        .name
        .toLowerCase()
        .indexOf(query.toLowerCase()) >= 0 || item
        .itemTypeName
        .toLowerCase()
        .indexOf(query.toLowerCase()) >= 0;
  }

  renderDraggableInventoryItems = (items) => {
    const {lastPress, isPressed, mouseXY, characterId, order} = this.props;
    if (!order || !characterId) 
      return;
    return order.length > 0
      ? order.filter((item) => {
        return item.characterID === characterId;
      }).filter((item) => {
        return this.returnQuery(item, this.props.query);
      }).map((item, index) => {
        const key = item.id;
        let style;
        let x;
        let y;
        const visualPosition = order.filter((item) => {
          return item.characterID === characterId;
        }).indexOf(item);

        if (key === lastPress && isPressed) {
          [x, y] = mouseXY;
          style = {
            translateX: x,
            translateY: y,
            scale: spring(1.2, springSetting1),
            boxShadow1: spring(0.156863, springSetting1),
            boxShadow2: spring(0.227451, springSetting1)
          };

        } else {
          [x, y] = this.props.layout[visualPosition];
          style = {
            translateX: spring(x, springSetting2),
            translateY: spring(y, springSetting2),
            scale: spring(1, springSetting1),
            boxShadow1: spring(0, springSetting1),
            boxShadow2: spring(0, springSetting1)
          };
        }

        return (
          <Motion style={style} key={key}>
            {({translateX, translateY, scale, boxShadow1, boxShadow2}) => <ItemContainer
              key={item.itemID}
              style={{
              WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
              transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
              boxShadow: `0px 3px 10px rgba(0,0,0, ${boxShadow1}), 0px 3px 10px rgba(0,0,0, ${boxShadow2})`,
              zIndex: (key === lastPress && isPressed)
                ? 1200
                : visualPosition
            }}
              onMouseEnter={(e) => this.props.handleItemHover(item.id, this.props.characterId, this.props.items[item.id])}
              onMouseLeave={() => this.props.handleItemMouseLeave(item.id)}
              onMouseDown={(e) => this.props.handleMouseDown(key, this.props.characterId, item, index, [x, y], e)}
              onTouchStart={(e) => this.props.handleTouchStart(key, this.props.characterId, item, index, [x, y], e)}>
              <InventoryItem key={key} item={this.props.items[item.id]}></InventoryItem>
            </ItemContainer>
}
          </Motion>
        );
      })
      : ''
  }

  render() {
    return (
      <Bucket
        vault={this.props.vault}
        data-flex
        data-row
        data-layout="start start"
        data-wrap>
        {this.renderDraggableInventoryItems(this.props.items)}
      </Bucket>
    );
  }
}

export default muiThemeable()(InventoryBucket);
