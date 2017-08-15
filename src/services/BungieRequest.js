import axios from 'axios';

export default function(authorization, apiKey, membershipType) {
  const bungieRequest = axios.create({
    baseURL: 'https://www.bungie.net',
    headers: {
      'X-API-Key': apiKey,
      Authorization: `Bearer ${authorization.access_token}`
    },
    withCredentials: true
  });

  const service = {

    getMembershipById() {
      return bungieRequest.get(`/Platform/User/GetBungieAccount/${authorization.membership_id}/${254}/`);
    },

    getCharacterById(characterID, destinyMembershipID) {
      return bungieRequest.get(`/D1/Platform/Destiny/${membershipType}/Account/${destinyMembershipID}/Character/${characterID}/Inventory/Summary/?definitions=true`);
    },

    getVaultSummary() {
      return bungieRequest.get(`D1/Platform/Destiny/${membershipType}/MyAccount/Vault/Summary/?definitions=true`)
    },

    getManifest() {
      return bungieRequest.get('/D1/Platform/Destiny/Manifest/')
    }
  };

  return service;
};
