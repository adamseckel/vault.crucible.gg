import store from './localStoreService';

function mapItems(items, definitions, buckets, storeID) {
  items.forEach((item) => {
    const bucketHash = storeID === 'vault' ? [definitions.items[item.itemHash].bucketTypeHash] : item.bucketHash;
    if (buckets[bucketHash] && buckets[bucketHash].items[storeID]) {
      buckets[bucketHash].items[storeID].push(Object.assign(item, {
        definition: definitions.items[item.itemHash]
      }));
    } else if (buckets[bucketHash] && !buckets[bucketHash].items[storeID]) {
      buckets[bucketHash].items[storeID] = [Object.assign(item, {
        definition: definitions.items[item.itemHash]
      })];
    } else if (!buckets[bucketHash]) {
      buckets[bucketHash] = {
        name: definitions.buckets[bucketHash].bucketName,
        count: definitions.buckets[bucketHash].itemCount,
        items: {
          [storeID]: [Object.assign(item, {
            definition: definitions.items[item.itemHash]
          })]
        }
      }
    }
  });
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
      return getBungieRequest().then((bungieRequest) => bungieRequest.getAccountCharacters(destinyMembershipID).then(({data}) => data.characters));
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

    getItems(clientWidth, characters) {
      const requests = characters.map((character) => {
        const {characterId, membershipId} = character.characterBase;
        return getBungieRequest().then((bungieRequest) => bungieRequest.getCharacterById(characterId, membershipId).then(({data, definitions}) => {
          return {
            inventory: {data, definitions},
            key: characterId
          };
        }));
      });

      requests.push(
        getBungieRequest().then((bungieRequest) => bungieRequest.getVaultSummary().then(({data, definitions}) => {
          return {
            inventory: {data, definitions},
            key: 'vault'
          };
        })
      ));

      return Promise.all(requests).then((locations) => {
        const itemBuckets = {};
        locations.forEach((character) => mapItems(character.inventory.data.items, character.inventory.definitions, itemBuckets, character.key));

        delete itemBuckets[1801258597];
        delete itemBuckets[2197472680];
        delete itemBuckets[3284755031];
        delete itemBuckets[375726501];

        const vaultColumns = Math.floor((clientWidth - 90 - (271 * locations.filter((store) => {
          return store.key !== 'vault';
        }).length)) / 52);

        Object.keys(itemBuckets).forEach((bucketKey) => {
          itemBuckets[bucketKey].rowHeight = calculateRowHeight(itemBuckets[bucketKey].items, vaultColumns);
        });

        return itemBuckets;
      });
    }
  }
};
