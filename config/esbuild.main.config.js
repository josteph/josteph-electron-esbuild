const path = require('path');
const aliasResolverPlugin = require('../esbuildPlugins/esbuild-plugin-alias-resolver');

/**
 * @var {Partial<import('esbuild').BuildOptions>}
 */
module.exports = {
  platform: 'node',
  entryPoints: [
    path.resolve('src/main/main.ts'),
    path.resolve('src/main/socket.ts'),
    path.resolve('src/main/socket.uws.ts'),
  ],
  bundle: true,
  target: 'node14.16.0', // electron version target
  loader: {
    '.ts': 'ts',
  },
  plugins: [aliasResolverPlugin()],
}
