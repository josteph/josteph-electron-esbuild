const path = require('path')
const sassPlugin = require('esbuild-plugin-sass');
const aliasResolverPlugin = require('../esbuildPlugins/esbuild-plugin-alias-resolver');
const remarkPlugin = require('../esbuildPlugins/esbuild-plugin-remark');

/**
 * @var {Partial<import('esbuild').BuildOptions>}
 */
module.exports = {
  platform: 'browser',
  entryPoints: [path.resolve('src/renderer/index.tsx')],
  bundle: true,
  target: 'chrome89', // electron version target
  plugins: [sassPlugin(), aliasResolverPlugin({ srcDir: 'src/renderer' }), remarkPlugin()],
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.css': 'css',
  },
}
