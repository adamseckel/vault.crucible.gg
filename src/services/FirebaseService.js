export default function(db) {
  return {
    insertOrUpdateUserAndTrackVisit({
      membershipId,
      locale,
      blizzardDisplayName = 'None',
      displayName,
      psnDisplayName = 'None',
      xboxDisplayName = 'None',
    }) {
      return Promise.all([
        db
          .child('users-by-bungie-id')
          .child(membershipId)
          .update({
            locale,
            blizzardDisplayName,
            displayName,
            psnDisplayName,
            xboxDisplayName,
          }),

        db
          .child('sessions-by-bungie-id')
          .child(membershipId)
          .push(Date.now()),
      ]);
    },

    insertOrUpdateCharacters(bungieID, charactersByID) {
      return db
        .child('characters-by-bungie-id')
        .child(bungieID)
        .update(charactersByID);
    },

    insertOrUpdateItems(bungieID, itemsByID) {
      return db
        .child('items-by-bungie-id')
        .child(bungieID)
        .update(itemsByID);
    },

    trackTransferByBungieID(bungieID, tracking) {
      return db
        .child('transfers-by-bungie-id')
        .child(bungieID)
        .push(tracking);
    },

    trackPollEventByBungieID(bungieID, tracking) {
      return db
        .child('poll-events-by-bungie-id')
        .child(bungieID)
        .push(tracking);
    },

    trackError(errorMessage) {
      const timestamp = Date.now();
      return db.child('errors').push({ errorMessage, timestamp });
    },
  };
}
