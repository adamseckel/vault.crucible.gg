import React, { Component } from 'react';
import {
  BungieAuthorizationService,
  BungieRequestService,
  ManifestRequestService,
  ItemService,
  store,
} from './services';

const vault = {
  characterLevel: '',
  classHash: 'vault',
  raceHash: 'full',
  light: '',
  id: 4567,
  levelProgression: {
    level: undefined,
  },
};

let inventoryPollingInterval, inventoryPollingDelay;

function devLog(log) {
  if (process.env.NODE_ENV === 'production') return;
  console.log(log);
}

function calculateVaultColumns(characters, gridWidth) {
  return Math.floor(
    (gridWidth -
      90 -
      271 *
        characters.filter(store => {
          return store.key !== 'vault';
        }).length) /
      52,
  );
}

function removeSplash() {
  const splash = document.getElementById('splash');
  splash.className = 'removed';
  setTimeout(() => {
    splash.parentNode.removeChild(splash);
  }, 400);
}

class Reducer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bungieRequestService: false,
      authenticated: false,
      membership: {},
      characters: [],
      items: {},
      inventoryPolling: false,
      notifications: {},
      platform: 'xb1',
      vault,
      firebaseService: props.firebaseService,
      apiKey: props.apiKey,
      disablePolling: false,
      poller: {
        count: 0,
      },
    };
  }

  onAuthorize = () => {
    return window.location.replace(
      `https://www.bungie.net/en/OAuth/Authorize?client_id=${
        this.state.apiKey.client_id
      }&response_type=code`,
    );
  };

  authorize = () => {
    return BungieAuthorizationService(this.state.apiKey).then(authorization => {
      return BungieRequestService(
        authorization,
        this.state.apiKey.key,
        this.state.destinyMembership.membershipType,
      );
    });
  };

  componentDidMount() {
    const manifestRequestService = ManifestRequestService(this.props.manifestVersion);
    return store
      .get('Vault::AccountIndex')
      .then(savedAccountIndex => {
        return BungieAuthorizationService(this.state.apiKey).then(authorization => {
          return BungieRequestService(authorization, this.state.apiKey.key)
            .getMembershipById()
            .then(membership => {
              return this.setMembership(
                membership,
                authorization,
                manifestRequestService,
                savedAccountIndex,
              );
            });
        });
      })
      .catch(error => {
        removeSplash();
        this.state.firebaseService.trackError(error.message);
        console.log(`Start Up Error: ${error.message}`);
      });
  }

  setMembership = (membership, authorization, manifestRequestService, accountIndex) => {
    const destinyMembership = membership.destinyMemberships[accountIndex || 0];
    const authenticated = true;
    const bungieRequestService = BungieRequestService(
      authorization,
      this.state.apiKey.key,
      destinyMembership.membershipType,
    );

    try {
      this.state.firebaseService.insertOrUpdateUserAndTrackVisit(membership.bungieNetUser);
    } catch (e) {
      this.state.firebaseService.trackError(`Failed to track visist: ${e.message}`);
    }

    this.setState({
      bungieRequestService,
      membership,
      destinyMembership,
      authenticated,
    });
    const accounts = membership && membership.destinyMemberships.length;
    this.updateWidth();
    window.addEventListener('resize', this.updateWidth);
    return this.getAccount(destinyMembership, membership, manifestRequestService)
      .then(() => {
        return store.set('Vault::AccountIndex', accountIndex);
      })
      .catch(error => {
        if (accounts > 1 && accountIndex < accounts) {
          return this.setMembership(
            membership,
            authorization,
            manifestRequestService,
            accountIndex + 1,
          );
        } else {
          this.state.firebaseService.trackError('No Destiny 2 Accounts Found');
          throw new Error('No Destiny 2 Accounts Found');
        }
      });
  };

  getAccount = (destinyMembership, membership, manifestRequestService) => {
    return Promise.all([
      ItemService(this.authorize).getCharacters(destinyMembership.membershipId),
      manifestRequestService.getInventoryItemDefinitions(),
      manifestRequestService.getDestinyInventoryBucketDefinitions(),
      manifestRequestService.getStatsDefinitions(),
      manifestRequestService.getPerksDefinitions(),
    ]).then(
      ([
        characters,
        inventoryDefinitions,
        bucketDefinitions,
        statsDefinitions,
        perksDefinitions,
      ]) => {
        removeSplash();
        const charactersByID = characters;
        this.state.firebaseService.insertOrUpdateCharacters(
          membership.bungieNetUser.membershipId,
          charactersByID,
        );

        const characterArray = Object.keys(characters).map(characterId => characters[characterId]);
        const vaultColumns = calculateVaultColumns(characterArray, this.state.clientWidth);

        this.setState({
          characters: characterArray,
          charactersByID,
          vaultColumns,
          inventoryDefinitions,
          bucketDefinitions,
          statsDefinitions,
          perksDefinitions,
        });

        return this.updateItems(destinyMembership.membershipId);
      },
    );
  };

  searchForItem = (event, query) => {
    this.setState({ query });
  };

  startInventoryPolling = () => {
    if (!this.state.authenticated || this.state.inventoryPolling || this.state.disablePolling)
      return;

    if (inventoryPollingDelay) {
      clearTimeout(inventoryPollingDelay);
    }
    if (inventoryPollingInterval) {
      clearTimeout(inventoryPollingInterval);
    }
    const instance = Date.now();
    devLog('Start Poll', instance);
    inventoryPollingDelay = setTimeout(() => {
      this.inventoryPoll(0, instance);
    }, 15000);

    this.setState({
      inventoryPolling: true,
    });
  };

  inventoryPoll = (count, instance) => {
    devLog('Poll', count, instance);
    if (!this.state.inventoryPolling) return;
    const basePollingInterval = 10000;
    const ppm = 60000 / basePollingInterval;
    const pollDelay =
      count > ppm * 5 ? count / (ppm * 5) * basePollingInterval : basePollingInterval;

    inventoryPollingInterval = setTimeout(() => {
      if (!this.state.authenticated) return;

      try {
        this.state.firebaseService.trackPollEventByBungieID(
          this.state.membership.bungieNetUser.membershipId,
          { count },
        );
      } catch (e) {
        this.state.firebaseService.trackError(`Failed to track poll: ${e.message}`);
      }

      return Promise.all([
        this.updateItems(this.state.destinyMembership.membershipId),
        this.updateCharacters(this.state.destinyMembership.membershipId),
      ])
        .then(() => {
          if (!this.state.inventoryPolling) return;
          devLog('Poll Data', count, instance);
          return this.inventoryPoll(count + 1, instance);
        })
        .catch(error => {
          this.state.firebaseService.trackError(error.message);
          console.log(`Polling Error: ${error.message}`);
        });
    }, pollDelay);
  };

  updateItems = destinyMembershipID => {
    return ItemService(this.authorize)
      .getItems(
        this.state.clientWidth,
        this.state.characters,
        destinyMembershipID,
        this.state.inventoryDefinitions,
        this.state.bucketDefinitions,
        this.state.statsDefinitions,
      )
      .then(items => {
        this.setState({ items });
      });
  };

  onFeedback = () => {
    return window.open(
      'https://twitter.com/intent/tweet?text=@hemlok&hashtags=cruciblegg',
      '_blank',
    );
  };

  stopInventoryPolling = () => {
    devLog('Stop Polling');
    clearTimeout(inventoryPollingInterval);
    clearTimeout(inventoryPollingDelay);

    this.setState({
      inventoryPolling: false,
    });
  };

  getItemDetail = (characterID, itemInstanceID) => {
    const { membershipId } = this.state.destinyMembership;
    return ItemService(this.authorize).getItemDetail(membershipId, characterID, itemInstanceID);
  };

  createTransferPromise = (
    itemReferenceHash,
    itemId,
    lastCharacterID,
    initialCharacterID,
    shouldEquip,
    shouldUnequipReplacementItemID,
  ) => {
    const toVault = lastCharacterID === 'vault';
    const fromVault = initialCharacterID === 'vault';
    this.state.firebaseService.trackTransferByBungieID(
      this.state.membership.bungieNetUser.membershipId,
      {
        itemID: itemId,
        lastCharacterID,
        initialCharacterID,
        shouldEquip,
        shouldUnequipReplacementItemID: shouldUnequipReplacementItemID
          ? shouldUnequipReplacementItemID
          : false,
      },
    );

    try {
      this.state.firebaseService.trackTransferByBungieID(
        this.state.membership.bungieNetUser.membershipId,
        {
          itemID: itemId,
          lastCharacterID,
          initialCharacterID,
          shouldEquip,
          shouldUnequipReplacementItemID: shouldUnequipReplacementItemID
            ? shouldUnequipReplacementItemID
            : false,
        },
      );
    } catch (e) {
      this.state.firebaseService.trackError(`Failed to track transfer: ${e.message}`);
    }

    if (shouldEquip && lastCharacterID === initialCharacterID) {
      return ItemService(this.authorize).equipItem(itemId, lastCharacterID);
    }

    if (shouldUnequipReplacementItemID && lastCharacterID === initialCharacterID) {
      return ItemService(this.authorize).equipItem(shouldUnequipReplacementItemID, lastCharacterID);
    }

    const isSpecificVaultTransaction = toVault || fromVault;
    const characterID = isSpecificVaultTransaction
      ? toVault ? initialCharacterID : lastCharacterID
      : initialCharacterID;
    const isVaultTransaction = isSpecificVaultTransaction ? toVault : true;

    return ItemService(this.authorize)
      .moveItem(itemReferenceHash, itemId, characterID, isVaultTransaction)
      .then(result => {
        return fromVault && shouldEquip
          ? ItemService(this.authorize).equipItem(itemId, lastCharacterID)
          : !isSpecificVaultTransaction
            ? ItemService(this.authorize)
                .moveItem(itemReferenceHash, itemId, lastCharacterID)
                .then(result => {
                  return shouldEquip
                    ? ItemService(this.authorize).equipItem(itemId, lastCharacterID)
                    : result;
                })
            : result;
      });
  };

  moveItem = (
    itemReferenceHash,
    itemId,
    lastCharacterID,
    initialCharacterID,
    shouldEquip,
    shouldUnequipReplacementItemID,
  ) => {
    return this.createTransferPromise(
      itemReferenceHash,
      itemId,
      lastCharacterID,
      initialCharacterID,
      shouldEquip,
      shouldUnequipReplacementItemID,
    )
      .then(() =>
        this.updateCharacters(this.state.destinyMembership.membershipId).then(
          this.addNotification('Success'),
        ),
      )
      .catch(error => {
        this.addNotification(error.message);
        this.state.firebaseService.trackError(error.message);
        throw new Error(error.message);
      });
  };

  addNotification = message => {
    const stamp = Date.now();
    this.setState({
      notifications: Object.assign({}, this.state.notifications, {
        [stamp]: { message, timestamp: Date.now() },
      }),
    });

    setImmediate(() => {
      this.setState({
        notifications: Object.assign({}, this.state.notifications, {
          [stamp]: Object.assign(this.state.notifications[stamp], {
            rendered: true,
          }),
        }),
      });
    });

    setTimeout(() => {
      this.setState({
        notifications: Object.assign({}, this.state.notifications, {
          [stamp]: Object.assign(this.state.notifications[stamp], {
            rendered: false,
          }),
        }),
      });
    }, 3000);

    return Promise.resolve();
  };

  handleAccountChange = (event, index, destinyMembership) => {
    this.setState({
      destinyMembership,
    });

    store.set(
      'Vault::AccountIndex',
      this.state.membership.destinyMemberships.indexOf(destinyMembership),
    );

    return Promise.all([
      this.updateCharacters(destinyMembership.membershipId),
      this.updateItems(destinyMembership.membershipId),
    ]).catch(error => {
      this.state.firebaseService.trackError(error.message);
      console.log(error.message);
    });
  };

  updateCharacters = membershipID => {
    return ItemService(this.authorize)
      .getCharacters(membershipID)
      .then(characters => {
        this.setState({
          characters: Object.keys(characters).map(characterId => characters[characterId]),
          charactersByID: characters,
        });
      });
  };

  updateWidth = () => {
    this.setState({
      clientWidth: this.refs.client.clientWidth,
      clientXY: [this.refs.client.clientWidth, window.innerHeight],
      vaultColumns: calculateVaultColumns(this.state.characters, this.refs.client.clientWidth),
    });
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', () => this.updateWidth());
  };

  onReload = () => {
    this.setState({ reloading: true });
    return ItemService(this.authorize)
      .getItems(this.state.clientWidth, this.state.characters)
      .then(characterItems => {
        this.setState({
          items: characterItems,
          reloading: false,
        });
      });
  };

  onLogout = () => {
    return store.delete('Vault::Authorization').then(() => {
      this.setState({
        authenticated: false,
        characters: undefined,
        items: undefined,
        itemService: undefined,
        bungieRequestService: undefined,
      });
    });
  };

  render() {
    return <div ref="client">{this.props.children({ store: this.state, actions: this })}</div>;
  }
}

export default Reducer;
