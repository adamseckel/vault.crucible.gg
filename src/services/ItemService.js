import store from './localStoreService';

function reduceToBuckets(buckets, item) {
  if (buckets[item.inventory.bucketTypeHash] && buckets[item.inventory.bucketTypeHash].items[item.characterID]) {
    buckets[item.inventory.bucketTypeHash].items[item.characterID].push(item);
  } else if (buckets[item.inventory.bucketTypeHash] && !buckets[item.inventory.bucketTypeHash].items[item.characterID]) {
    buckets[item.inventory.bucketTypeHash].items[item.characterID] = [item];
  } else if (!buckets[item.inventory.bucketTypeHash]) {
    buckets[item.inventory.bucketTypeHash] = {
      items: {
        [item.characterID]: [item]
      }
    }
  }
  return buckets;
}

function calculateRowHeight(bucketItems, vaultColumns) {
  return Object.keys(bucketItems).map((characterID) => {
    return bucketItems[characterID] ? Math.ceil((bucketItems[characterID].length * 52 / (characterID === 'vault' ? vaultColumns : 3) + 52)) : 0;
  }).reduce((a, b) => {
    return a > b ? a : b;
  });
}

export default function(getBungieRequest) {
  return {
    getCharacters(destinyMembershipID) {
      return getBungieRequest().then((bungieRequest) => bungieRequest.getAccountCharacters(destinyMembershipID).then(({characters}) => characters.data));
    },

    getCachedItems() {
      return store.get('Vault::Cache');
    },

    getItemDetail(destinyMembershipID, characterID, itemInstanceID) {
      return getBungieRequest().then((bungieRequest) => bungieRequest.getItemDetail(destinyMembershipID, characterID, itemInstanceID));
    },

    moveItem(itemReferenceHash, itemID, characterId, vault) {
      return getBungieRequest().then((bungieRequest) => bungieRequest.moveItem(itemReferenceHash, itemID, characterId, vault));
    },

    equipItem(itemId, characterId) {
      return getBungieRequest().then((bungieRequest) => bungieRequest.equipItem(itemId, characterId));
    },

    getCharacter(characterID, characterMembershipID) {
      return getBungieRequest().then((bungieRequest) => bungieRequest.getCharacterById(characterID, characterMembershipID).then(({data}) => data));
    },

    getItems(clientWidth, characters, membershipId, manifest, bucketDefinitions, statsDefinitions) {
      const requests = characters.map((character) => {
        const {characterId, membershipId} = character;
        return getBungieRequest().then((bungieRequest) => bungieRequest.getCharacterById(characterId, membershipId).then(({character, inventory, equipment, itemComponents}) => {
          return {
            character,
            inventory,
            equipment,
            itemComponents,
            key: characterId
          };
        }));
      });

      requests.push(
        getBungieRequest().then((bungieRequest) => bungieRequest.getProfileInventory(membershipId).then(({profileInventory, itemComponents}) => {
          return {
            inventory: profileInventory,
            itemComponents,
            key: 'vault'
          };
        })
      ));

      return Promise.all(requests).then((locations) => {
        const itemBuckets = locations.map(({inventory = {data: {items: []}}, equipment = {data: {items: []}}, itemComponents, key}) => {
          return inventory.data.items.concat(equipment.data.items).map((rawItem) => {
            const {classType, displayProperties, equippable, inventory, itemTypeDisplayName, nonTransferrable, perks, sockets, stats, redacted} = manifest[rawItem.itemHash];
            const instance = itemComponents.instances.data[rawItem.itemInstanceId];
            return {
              ...rawItem,
              characterID: key,
              id: rawItem.itemHash,
              itemId: rawItem.itemHash,
              classType,
              displayProperties,
              equippable,
              inventory,
              itemTypeDisplayName,
              nonTransferrable,
              perks,
              sockets,
              stats,
              redacted,
              instance
            }
          });
        })
        .reduce((a, b) => a.concat(b), [])
        .reduce(reduceToBuckets, {});

        const vaultColumns = Math.floor((clientWidth - 90 - (271 * locations.filter((character) => {
          return character.key !== 'vault';
        }).length)) / 52);

        Object.keys(itemBuckets).forEach((bucketKey) => {
          const bucket = bucketDefinitions[bucketKey];
          itemBuckets[bucketKey].rowHeight = calculateRowHeight(itemBuckets[bucketKey].items, vaultColumns);
          itemBuckets[bucketKey].name = bucket.displayProperties.name;
        });

        return itemBuckets;
      });
    }
  }
};
