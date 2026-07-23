function readPackage(pkg) {
  if (pkg.name === 'metro-cache') {
    pkg.exports = {
      ".": "./src/index.js",
      "./src/stores/FileStore": "./src/stores/FileStore.js",
      "./src/stores/FileStore.js": "./src/stores/FileStore.js",
      "./*": "./*"
    };
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
