const fs = require('fs');

module.exports = {
  process(_src, filename) {
    if (filename.endsWith('.svg')) {
      const content = fs.readFileSync(filename, 'utf8');
      return {
        code: `module.exports = ${JSON.stringify(content)};`,
      };
    }
    return {
      code: `module.exports = 1;`,
    };
  },
};
