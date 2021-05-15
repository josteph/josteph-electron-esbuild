const path = require('path');
const fs = require('fs');
const getTSConfig = require('../utils/tsConfig');
const { tsConfig } = getTSConfig(process.cwd());

function moduleAliasResolver({ contents, args, srcDir }) {
  if (!(tsConfig && tsConfig.options && tsConfig.options.paths)) {
    return contents;
  }

  // Usually in tsconfig user specify the rest of directory path as wildcard
  function removeStar(str) {
    return str.replace(/\/\*$/, '/');
  }

  let finalContents = contents;
  const importAliases = tsConfig.options.paths || [];

  for (const aliasPath in importAliases) {
    if (aliasPath.includes('*') || importAliases[aliasPath][0].includes(srcDir)) {
      const cleanedPath = removeStar(aliasPath);

      // Resolved relative path to be used
      const relativeTargetImport = path.relative(path.dirname(args.path), removeStar(importAliases[aliasPath][0]));

      // There are cases like below
      // path.relative('a', 'a/file.css') === 'file.css'
      //
      // In our environment, this could be treated as third party import.
      // The correct one is './file.css' instead.
      const finalRelativePath = relativeTargetImport.startsWith('.')
        ? relativeTargetImport
        : `./${relativeTargetImport}`;

      // Example: ../../constantsWindow/getUsedConstants/client.js
      const hasExtension = Boolean(path.extname(finalRelativePath));

      finalContents = finalContents.replace(
        new RegExp(cleanedPath, 'gm'),
        `${finalRelativePath}${hasExtension ? '' : '/'}`,
      );
    } else {
      // Usually node_modules import path, normal replace
      finalContents = finalContents.replace(new RegExp(aliasPath, 'gm'), importAliases[aliasPath][0]);
    }
  }

  return finalContents;
};

function aliasResolverPlugin(options = {}) {
  const { filter = /.*/, namespace = 'file', srcDir = 'src' } = options;

  return {
    name: 'alias-resolver',
    setup(build) {
      build.onLoad({ filter, namespace }, async args => {
        const contents = await fs.promises.readFile(args.path, 'utf8');
        const extension = path.extname(args.path).replace('.', '');
        const loader = extension === 'js' ? 'jsx' : extension;

        const finalContents = moduleAliasResolver({ contents, args, srcDir });

        return {
          loader,
          contents: finalContents
        };
      });
    },
  }
}

module.exports = aliasResolverPlugin;
