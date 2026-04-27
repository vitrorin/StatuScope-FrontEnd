const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Build-time-only deps (storybook/vite chain) that ship optional native bindings
// not installed on this platform. Metro's file-watcher otherwise crashes with
// `ENOENT: no such file or directory, watch ...@rolldown/binding-wasm32-wasi/...`
config.resolver = config.resolver || {};
config.resolver.blockList = exclusionList([
  /node_modules\/@rolldown\/.*/,
]);

config.watcher = config.watcher || {};
config.watcher.additionalExts = config.watcher.additionalExts || [];
config.watcher.watchman = config.watcher.watchman || {};
config.watcher.healthCheck = { enabled: false };

module.exports = withNativeWind(config, { input: './global.css' });
