import axios from 'axios';

function handleBungieResponse({data}) {
  const {ErrorCode, Message} = data;
  if (ErrorCode !== 1) {
    throw new Error(Message);
  }
  return data;
}

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

    getAccountCharacters(destinyMembershipID) {
      return bungieRequest.get(`/D1/Platform/Destiny/${membershipType}/Account/${destinyMembershipID}/Summary/?definitions=true`);
    },

    getCharacterById(characterID, destinyMembershipID) {
      return bungieRequest.get(`/D1/Platform/Destiny/${membershipType}/Account/${destinyMembershipID}/Character/${characterID}/Inventory/Summary/?definitions=true`);
    },

    getVaultSummary() {
      return bungieRequest.get(`D1/Platform/Destiny/${membershipType}/MyAccount/Vault/Summary/?definitions=true`)
    },

    getManifest() {
      return bungieRequest.get('/D1/Platform/Destiny/Manifest/')
    },

    getItemDetail(destinyMembershipID, characterID, itemInstanceID) {
      return bungieRequest.get(`/D1/Platform/Destiny/${membershipType}/Account/${destinyMembershipID}/Character/${characterID}/Inventory/${itemInstanceID}/?definitions=true`)
    },

    moveItem(itemReferenceHash, itemId, characterId, transferToVault = false) {
      return bungieRequest.post(`/D1/Platform/Destiny/TransferItem/`, {
        itemReferenceHash, itemId, membershipType, characterId, transferToVault, stackSize: 1
      }).then(handleBungieResponse);
    },

    equipItem(itemId, characterId) {
      return bungieRequest.post(`D1/Platform/Destiny/EquipItem/`, {
        characterId, itemId, membershipType
      }).then(handleBungieResponse);
    },

    getCharacterSummaryById(characterID, destinyMembershipID) {
      return bungieRequest.get(`/D1/Platform/Destiny//${membershipType}/Account/${destinyMembershipID}/Character/${characterID}/Complete/`);
    }
  };

  return service;
};
