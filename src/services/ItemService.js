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

function orderByRarity(bucketItems) {
  const rarity = ['common', 'rare', 'legendary', 'exotic'];
  return Object.keys(bucketItems.items).map((characterID) => {
    return [characterID, bucketItems.items[characterID].sort((a, b) => {
      return rarity.indexOf(a.definition.tierTypeName.toLowerCase()) < rarity.indexOf(b.definition.tierTypeName.toLowerCase());
    })];
  }).reduce((o, [key, val]) => {
    o[key] = val;
    return o
  }, {});
}


export default function(bungieRequestService) {
  function service(rawMembership) {
    console.log(rawMembership)
    return {
      buckets: {},
      rawMembership,
      getCharacters() {
        return rawMembership.destinyAccounts[0].characters;
      },

      getCachedItems() {
        return store.get('Vault::Cache');
      },

      moveItem(itemReferenceHash, itemID, characterId, vault) {
        return bungieRequestService.moveItem(itemReferenceHash, itemID, characterId, vault);
      },

      equipItem(itemId, characterId) {
        return bungieRequestService.equipItem(itemId, characterId);
      },

      filterItems(query, filteredItems) {
        if (query === '') {
          return undefined;
        }

        return Object.keys((filteredItems || this.buckets)).forEach((bucketKey) => {
          Object.keys((filteredItems || this.buckets)[bucketKey].items).forEach((storeKey) => {
            const itemList = (filteredItems || this.buckets)[bucketKey].items[storeKey].filter((item) => {
              return item.definition.itemName.indexOf(query) >= 0;
            });
            (filteredItems || this.buckets)[bucketKey].items[storeKey] = itemList;
          })
        });
      },

      getItems(clientWidth) {
        const requests = rawMembership.destinyAccounts[0].characters.map((character) => {
          return bungieRequestService.getCharacterById(character.characterId, character.membershipId).then((data) => {
            return {
              inventory: data.data.Response,
              key: character.characterId
            };
          })
        });

        requests.push(
          bungieRequestService.getVaultSummary().then((data) => {
            return {
              inventory: data.data.Response,
              key: 'vault'
            };
          })
        );

        return Promise.all(requests).then((characters) => {
          const itemBuckets = {};
          characters.forEach((character) => mapItems(character.inventory.data.items, character.inventory.definitions, itemBuckets, character.key));

          delete itemBuckets[1801258597]
          delete itemBuckets[2197472680]
          delete itemBuckets[3284755031]
          delete itemBuckets[375726501]
          const vaultColumns = Math.floor((clientWidth - 90 - (271 * characters.filter((store) => {
            return store.key !== 'vault';
          }).length)) / 52);

          Object.keys(itemBuckets).forEach((bucketKey) => {
            itemBuckets[bucketKey].rowHeight = calculateRowHeight(itemBuckets[bucketKey].items, vaultColumns);
            itemBuckets[bucketKey].items = orderByRarity(itemBuckets[bucketKey]);
          });

          this.buckets = itemBuckets;
          return itemBuckets;
        });
      }
    }
  };

  return bungieRequestService.getMembershipById().then(({data}) => {
    if (data.ErrorCode === 1618) {
      return false;
    }
    return service(data.Response);
  });
};
