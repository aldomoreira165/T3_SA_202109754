module.exports = {
  install: {
    registry: "https://registry.npmjs.org",
    production: process.env.NODE_ENV === "production"
  },
  test: {
    coverage: true
  }
};