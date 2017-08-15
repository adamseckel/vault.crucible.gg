export default {
  get: function(key) {
    return Promise.resolve(JSON.parse(localStorage.getItem(key)));
  },
  set: function(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    return Promise.resolve(data);
  }
};
