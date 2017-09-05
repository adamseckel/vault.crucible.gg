import axios from 'axios';

function handleBungieResponse({data}) {
  console.log(data);
  const {ErrorCode, Message} = data;
  if (ErrorCode !== 1) {
    throw new Error(Message);
  }
  return data.Response;
}

export default function(authorization, apiKey, membershipType, fakeMembershipID) {
  const bungieRequest = axios.create({
    baseURL: 'https://www.bungie.net/Platform',
    headers: {
      'X-API-Key': apiKey,
      Authorization: `Bearer ${authorization.access_token}`
    },
    withCredentials: true
  });
  
  const service = {

    getMembershipById(fakeMembershipID) {
      return bungieRequest.get(`/User/GetMembershipsById/${fakeMembershipID || authorization.membership_id}/${254}/`).then(handleBungieResponse);
    },

    getAccountCharacters(destinyMembershipID) {
      return bungieRequest.get(`/Destiny2/${membershipType}/Profile/${destinyMembershipID}/?components=100,102,200,300,302,304,307`).then(handleBungieResponse);
      // return bungieRequest.get(`/D1/Platform/Destiny/${membershipType}/Account/${destinyMembershipID}/Summary/?definitions=true`).then(handleBungieResponse);
    },

    getCharacterById(characterID, destinyMembershipID) {
      return bungieRequest.get(`/Destiny2/${membershipType}/Profile/${destinyMembershipID}/Character/${characterID}/`).then(handleBungieResponse);
      // return bungieRequest.get(`/D1/Platform/Destiny/${membershipType}/Account/${destinyMembershipID}/Character/${characterID}/Inventory/Summary/?definitions=true`).then(handleBungieResponse);
    },

    getVaultSummary() {
      //DEPRECATED
      return bungieRequest.get(`D1/Platform/Destiny/${membershipType}/MyAccount/Vault/Summary/?definitions=true`).then(handleBungieResponse);
    },

    getItemDetail(destinyMembershipID, characterID, itemInstanceID) {
      return bungieRequest.get(`/Destiny2/${membershipType}/Profile/${destinyMembershipID}/Item/${itemInstanceID}/`).then(handleBungieResponse);
    },

    moveItem(itemReferenceHash, itemId, characterId, transferToVault = false) {
      return bungieRequest.post(`/Destiny2/Actions/Items/TransferItem/`, {
        itemReferenceHash, itemId, membershipType, characterId, transferToVault, stackSize: 1
      }).then(handleBungieResponse);
    },

    equipItem(itemId, characterId) {
      return bungieRequest.post(`/Destiny2/Actions/Items/EquipItem/`, {
        characterId, itemId, membershipType
      }).then(handleBungieResponse);
    },
  };

  return service;
};
