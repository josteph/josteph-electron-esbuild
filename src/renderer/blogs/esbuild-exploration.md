---
title: 'Using esbuild As Your New Bundler'
description: 'Thoughts regarding esbuild as replacement of existing bundlers & babel for developing packages.'
published: 'March 8, 2021'
---

# Using esbuild As Your New Bundler

Published on March 8, 2021

---

## Table of Contents

## Introduction

You might have heard about [esbuild](https://esbuild.github.io/) before even reading this post. If you did, that's great! But if you never heard about it before this, or at least you haven't tried it, then **you should!**

You can make esbuild to become either a bundler, or just simply use it as a compiler in replacement of babel.

?> ⚠️
esbuild doesn't fully support **es5** syntax yet, you might want to reconsider about shipping stuffs with esbuild to old browsers. You can read about it in this [thread](https://github.com/evanw/esbuild/issues/297).

## Replacing Babel

We all know about babel, how powerful babel is, and how babel has helped us building great stuffs all around the web. But in for large scale project, you might have experienced that the build time takes very long! This might become one of the biggest productivity blocker.

Babel simply has more overhead cost than esbuild. Even if you cache the loader, esbuild is much much faster. Although, esbuild even put [restriction](https://esbuild.github.io/plugins/#plugin-api-limitations) for when writing plugin, so you might want to know this before really replacing babel, especially if you depend on specific babel plugins that is not present in esbuild.

Let us talk about how to replace babel with esbuild. But before this, you should know that babel can simply take a folder as entry points, but in esbuild you need to **specify** all the file paths that you are going to compile as an array of paths.

I suggest you to start from using **Typescript** because esbuild supports typescript natively, without adding new plugin. Therefore, I can say that probably it doesn't have any performance impact when you are compiling typescript or normal javascript files, unlike Babel.

If you are using typescript, you can get the list of needed files by using this method:

```js
// getTSConfig.js

const ts = require('typescript');

function getTSConfig(configPath = 'tsconfig.json') {
  const tsConfigFile = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    configPath
  );

  if (!tsConfigFile) {
    throw new Error(
      `tsconfig.json does not exist in the current directory: ${process.cwd()}`
    );
  }

  const configFile = ts.readConfigFile(tsConfigFile, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(
      `Cannot read TS configuration file from ${process.cwd()}: ${
        configFile.error
      }`
    );
  }

  const tsConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    process.cwd()
  );

  return { tsConfig, tsConfigFile };
}

module.exports = getTSConfig;
```

Now, let's pair it together with esbuild:

```js
const esbuild = require('esbuild');
const getTSConfig = require('./getTSConfig');

async function build() {
  const { tsConfig, tsConfigFile } = getTSConfig();

  try {
    await esbuild.build({
      color: true,
      entryPoints: tsConfig.fileNames,
      outdir: OUT_DIR,
      loader: {
        '.js': 'jsx', // if you are also compiling react files
      },
      format: 'esm', // can be also 'cjs'
      target: 'es2015',
      minify: false,
      bundle: false,
      tsconfig: tsConfigFile,
      plugins: [], // optional
    });
  } catch (error) {
    console.error(error);
  }
}
```

The example above only shown how to rely on typescript API to discover the files. In case you are not using typescript in your project, there is [a gist](https://gist.github.com/lovasoa/8691344#gistcomment-2927279) that lets you list all the files path in a folder recursively. But don't forget to filter only **.js** or **.jsx** files!

### Compiling other file assets

Using the configuration above, esbuild will skip to compile every files with extension that typescript unable to read. That means, if you are importing images in your js/ts files, they won't be exported in the out directory. This could lead to build time error.

Fortunately, here is a piece of code you might want to consider adding **after the build process is finished**:

```js
async function build() {
  ...

  try {
    const cpy = require('cpy');
    const relativeOutDir = path.relative(SRC_DIR, OUT_DIR);

    await cpy(['**', `!**/*.{js,ts,jx,tsx}`], relativeOutDir, {
      cwd: SRC_DIR,
      parents: true,
    });
  } catch (error) {
    console.error(error);
  }
}
```

**And you're done!**

If you are curious about the timing, try logging the time before & after each processes (build & copy).

## Using with existing bundler

If you are using webpack, I suggest you to have a look into [esbuild-loader](https://github.com/privatenumber/esbuild-loader).

If you are using rollup, there is also existing [plugin](https://github.com/egoist/rollup-plugin-esbuild) to pair with esbuild. You can refer to the [full configuration](https://github.com/josteph/elastic-node-example/blob/main/rollup.config.js) I have tried before writing this post.

There is not much to be explained, but simply follow the instructions given in their README.

## Future

Esbuild future looks bright. The development is actually very active, there is always a new patch coming in every 1 or 2 working days.

Esbuild has been adopted by [Vite.js](https://vitejs.dev/) in development mode only, and also [Remix](https://twitter.com/ryanflorence/status/1379498663446077440?s=20) as well.

## Conclusion

It is not easy to fully migrate from existing build tools, there are also many unexplained limitations or edge cases of esbuild in this blog. Although, you may find several testimonies about the significant speed improvements [here](https://github.com/privatenumber/esbuild-loader/issues/13).

If you previously relied on babel to help optimize your app, this could be a challenge for migrating your existing app. For example you might have been using **babel-plugin-lodash** to help your lodash imports to be cherry-picked. Then you might need to recheck your app vendor's size. But here is the [esbuild plugin](https://github.com/josteph/esbuild-plugin-lodash) to help you get similar behaviour.

If you are not convinced yet, just give it a try 😉

---
