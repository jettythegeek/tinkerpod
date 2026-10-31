const fs = require('fs');
const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async function ({ src, filename, options, ...rest }) {
  if (filename.endsWith('.svg')) {
    const svgContent = fs.readFileSync(filename, 'utf8');
    return upstreamTransformer.transform({
      src: `module.exports = ${JSON.stringify(svgContent)};`,
      filename,
      options,
      ...rest,
    });
  }
  return upstreamTransformer.transform({ src, filename, options, ...rest });
};
