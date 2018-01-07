import axios from 'axios';

function handleManifestResponse({ data }) {
  return data
    .map(entry => {
      const data = JSON.parse(entry.json);
      return [data.hash, data];
    })
    .reduce((o, [k, v]) => {
      o[k] = v;
      return o;
    }, {});
}

export default function(manifestVersion) {
  const manifestRequest = axios.create({
    baseURL: `${process.env.PUBLIC_URL}/manifest/${manifestVersion}/`,
  });

  const service = {
    getStatsDefinitions() {
      return manifestRequest.get('DestinyStatDefinition.json').then(handleManifestResponse);
    },

    getPerksDefinitions() {
      return manifestRequest.get('DestinySandboxPerkDefinition.json').then(handleManifestResponse);
    },

    getInventoryItemDefinitions() {
      return manifestRequest
        .get('DestinyInventoryItemDefinition.json')
        .then(handleManifestResponse);
    },

    getDestinyItemTierTypeDefinitions() {
      return manifestRequest.get('DestinyItemTierTypeDefinition.json').then(handleManifestResponse);
    },

    getDestinyStatGroupDefinition() {
      return manifestRequest.get('DestinyStatGroupDefinition.json').then(handleManifestResponse);
    },

    getDestinyInventoryBucketDefinitions() {
      return manifestRequest
        .get('DestinyInventoryBucketDefinition.json')
        .then(handleManifestResponse);
    },

    getDestinyTalentGridDefinition() {
      return manifestRequest.get('DestinyTalentGridDefinition.json').then(handleManifestResponse);
    },
  };

  return service;
}
