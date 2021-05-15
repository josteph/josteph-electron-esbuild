# Josteph: Electron x esbuild

Bootstrapped with [@electron-esbuild/create-app](https://github.com/Kiyozz/electron-esbuild/tree/main/packages/create-app).

---

Simply curious about the extend of esbuild integration as webpack replacement to build an Electron app.

It was quite simple, taken the original code from the [webpack version here](https://github.com/josteph/josteph-electron). But it comes with several limitations.

## SCSS / SASS Integration

Esbuild currently only supports standard `.css` loader. But in our case, we want to use `.scss` instead. Luckily, there is already [a community plugin](https://www.npmjs.com/package/esbuild-plugin-sass) for that.

### Caveats

Currently it only supports normal `.scss` or `.sass`. We previously had `.module.scss` files which are unusable right now because it requires additional setups to do that.

Therefore in this repo version, we **converted** them into normal `.scss` files in order to make it work. The trade-off is that it will be bundled into one final single `.css` file instead of being splitted and lazily loaded when needed.

## Import Aliases

Webpack has built-in support for `alias` that makes us easy to define any import alias paths we would like. But esbuild doesn't have one, yet.

I created a plugin named `esbuild-plugin-alias-resolver` which basically uses common regex patterns to replace the import paths according to the relative path of the importer.

### Caveats

Writing this plugin needs Typescript support, whereas the plugin relies on `compilerOptions.paths` field being defined in the `tsconfig.json`.

## Markdown (.md)

Earlier I had [this](https://github.com/josteph/josteph-electron/blob/ebcd46c74ee183e32facdb88443500bee955ca52/.erb/configs/webpack.config.base.js#L35) defined in the webpack config. This loader made development easier since it's quite extendable in some extent.

But since we are using esbuild, I had to make a plugin named `esbuild-plugin-remark`, which is opinionated to current needs only.

*In the future I will publish them as NPM package and become more extendable according to user specified options.

### Caveats

I also refactored how the app gets the raw & html converted markdown. The plugin gathers the `meta`, `slug`, `raw`, and `html` during **build** process, where it is consumed straight by the app in without the needs to use `fs` and `path` module.

This change was necessary in order to avoid having relying on node specific modules inside the renderer.

---

## Development

Simply clone this repository and run `pnpm install` in order to install dependencies.

Then, run `pnpm run dev` to start the development server.
