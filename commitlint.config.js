module.exports = {
  // https://www.conventionalcommits.org/en/v1.0.0-beta.2/
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 180],
    'footer-max-line-length': [2, 'always', 180],
    'header-max-length': [2, 'always', 180],
  },
};
