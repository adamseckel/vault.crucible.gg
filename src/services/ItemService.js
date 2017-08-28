import store from './localStoreService';

function mapItems(items, definitions, buckets, storeID) {
  console.log({items, definitions})
  items.forEach((item) => {
    const bucketHash = storeID === 'vault' ? [definitions.items[item.itemHash].bucketTypeHash] : item.bucketHash;
    const baseDefinition = definitions.items[item.itemHash];
    const stats = Object.keys(baseDefinition.stats).length ? Object.keys(baseDefinition.stats).map((key) => {
      return Object.assign(baseDefinition.stats[key], definitions.stats[key]);
    }) : undefined;

    const perks = (baseDefinition.perkHashes && baseDefinition.perkHashes.length) ? baseDefinition.perkHashes.map((hash) => {
      return Object.assign({}, definitions.perks[hash]);
    }) : undefined;

    if (buckets[bucketHash] && buckets[bucketHash].items[storeID]) {
      buckets[bucketHash].items[storeID].push(Object.assign(item, {
        definition: definitions.items[item.itemHash],
        stats,
        perks
      }));
    } else if (buckets[bucketHash] && !buckets[bucketHash].items[storeID]) {
      buckets[bucketHash].items[storeID] = [Object.assign(item, {
        definition: definitions.items[item.itemHash],
        stats,
        perks
      })];
    } else if (!buckets[bucketHash]) {
      buckets[bucketHash] = {
        name: definitions.buckets[bucketHash].bucketName,
        count: definitions.buckets[bucketHash].itemCount,
        items: {
          [storeID]: [Object.assign(item, {
            definition: definitions.items[item.itemHash],
            stats,
            perks
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
      getCharacters(destinyMembershipID) {
        return bungieRequestService.getAccountCharacters(destinyMembershipID).then(({data}) => {
          this.characters = data.Response.data.characters;
          console.log(data.Response)
          return this.characters;
        });
      },

      getCachedItems() {
        return store.get('Vault::Cache');
      },

      getItemDetail(destinyMembershipID, characterID, itemInstanceID) {
        return bungieRequestService.getItemDetail(destinyMembershipID, characterID === 'vault' ? undefined : characterID, itemInstanceID);
      },

      moveItem(itemReferenceHash, itemID, characterId, vault) {
        return bungieRequestService.moveItem(itemReferenceHash, itemID, characterId, vault);
      },

      equipItem(itemId, characterId) {
        return bungieRequestService.equipItem(itemId, characterId);
      },

      updateCharacter(characterID, characterMembershipID) {
        return bungieRequestService.getCharacterSummaryById(characterID, characterMembershipID).then(({data}) => {
          return data.Response.data.characterBase;
        });
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
        const requests = this.characters.map((character) => {
          const {characterId, membershipId} = character.characterBase;
          return bungieRequestService.getCharacterById(characterId, membershipId).then((data) => {
            return {
              inventory: data.Response,
              key: characterId
            };
          })
        }).concat(
          bungieRequestService.getVaultSummary().then((data) => {
            console.log(data)
            return {
              inventory: data.Response,
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
          console.log('MAPPED', {itemBuckets})
          this.buckets = itemBuckets;
          return itemBuckets;
        });
      }
    }
  };

  return bungieRequestService.getMembershipById().then((data) => {
    return service(data.Response);
  });
};
