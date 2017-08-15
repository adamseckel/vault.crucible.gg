const rewireEmotion = require('react-app-rewire-emotion');

/* config-overrides.js */
module.exports = function override(config, env) {
  return rewireEmotion(config, env, { inline: true });
}