const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, '../design')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];
config.transformer.babelTransformerPath = require.resolve('./metro-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
if (!config.resolver.assetExts.includes('ogg')) {
  config.resolver.assetExts.push('ogg');
}
if (!config.resolver.sourceExts.includes('svg')) {
  config.resolver.sourceExts.push('svg');
}

module.exports = withNativeWind(config, { input: './global.css' });
