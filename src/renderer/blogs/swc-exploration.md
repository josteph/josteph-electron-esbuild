---
title: 'Exploring SWC, a Rust Based Transpiler'
description: 'Comparing with esbuild and list out current issues / edge cases for swc.'
published: 'April 9, 2021'
---

# Exploring SWC, a Rust Based Transpiler

Published on April 9, 2021

---

## Table of Contents

## Introduction

In the last [blog](/blog/esbuild-exploration), we have talked about how to use esbuild programmatically in order to boost your build time performance. Not to forget about babel, a lot of transformations that we are not aware of using it in babel, might not be supported in either esbuild or swc.

Also a bit disclaimer about using these new build tools written in go / rust, they are **not fully stable yet**. Although they are actively being developed, try to be extra careful when you decide to use this on production!

What I'm going to discuss in this blog is about some edge cases you should know before even using swc.

!> This blog was written using swc version **1.2.51**, as of this article's publish date.

## Older Browsers Support

Talking about older browsers, you might want to ship your code in **ES5** format. Babel has [preset-env](https://babeljs.io/docs/en/babel-preset-env) which actually transpiles all ES5+ syntax to be compatible with ES5.

As mentioned in the previous [blog](/blog/esbuild-exploration), esbuild currently does not support ES5 syntax transformations. For safety, you can try esbuild for bundling server code instead or use it in development build like how [Vite](https://vitejs.dev/) does.

On the other hand, SWC (what we are going to talk about it in this blog), does support ES5 syntax transformations. Personally I didn't encounter any weird issue with its ES5 syntax transformations prior writing this blog, when trying it out in a large codebase. Set the target to `es5` and if you want, you can explore about [swc preset-env](https://swc.rs/docs/preset-env/).

## Discovered Issues

Below are several issues I personally encountered, I personally hope in the future SWC would focus on API stabilization instead.

### Export default is not evaluated

This is a quite interesting thing I just discovered during my years in Frontend development 😅.
I have opened an issue regarding this [here](https://github.com/swc-project/swc/issues/1568).

!> This issue was apparently fixed in **1.2.54**, but you might still want to consider reading about this hidden spec!

Let's say we have a file called `get.js`:

```js
export default function get(key) {
  // code here
}
```

And here's the result from transpiling using SWC:

```js
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});

function get(key) {
  // code here
}

exports.default = get;
```

What do you think would happen if another place import this file? Let's say there is `index.js` that actually re-export `get.js` file.

```js
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
Object.defineProperty(exports, 'get', {
  enumerable: true,
  get: function get() {
    return _get.default;
  },
});
Object.defineProperty(exports, 'set', {
  enumerable: true,
  get: function get() {
    return _set.default;
  },
});
Object.defineProperty(exports, 'del', {
  enumerable: true,
  get: function get() {
    return _del.default;
  },
});
exports.default = void 0;

var _get = _interopRequireDefault(require('./get'));

var _set = _interopRequireDefault(require('./set'));

var _del = _interopRequireDefault(require('./del'));

var _default = {
  get: _get.default,
  set: _set.default,
  del: _del.default,
};
exports.default = _default;
```

If you try to console the `_default` object, it will output:

```js
{
  get: undefined,
  set: fn,
  del: fn,
}
```

Or even scarier, I bundled these as 3rd party library with webpack, resulting in with this error:

```js
TypeError: undefinedundefined is not defined
```

What happened here? I honestly didn't know until I read about this [spec from webpack](https://github.com/webpack/webpack/issues/7767).

**Lessons learned:**

1. When writing a 3rd party library, we need to be extremely careful by knowing how other bundler works. Especially webpack and rollup, they might have different specs in mind. This is only just one example that things could go very wrong!

2. Babel might already be aware about this issue, or we just got off lucky. Babel will transpile into following which actually does the evaluation beforehand:

   ```js
   'use strict';

   Object.defineProperty(exports, '__esModule', {
     value: true,
   });

   exports.default = get; // exports function first

   function get(key) {
     // code here
   }
   ```

---

To conclude this issue, the safest code when exporting a function is:

```js
function get(key) {
  // code here
}

export default get;
```

Which will transpile to:

```js
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

function get(key) {
  // code here
}

var _default = get; // evaluate the function first
exports.default = _default;
```

### SWC Plugins

So I've been writing a swc plugin for emotion that behaves similarly as [babel-emotion-plugin](https://github.com/emotion-js/emotion/tree/master/packages/babel-plugin).

SWC plugin as of this blog was written, is highly unstable. See this [issue](https://github.com/swc-project/swc/issues/785), even the example plugin is not working. But since it has already been patched, I decided to give it a try as well.

Below are the edge cases that I stumbled upon writing a plugin in version `1.2.51`

1. If you are writing your syntax in commonjs, you must be aware that the `Visitor` class is exported as default. So you need to import it differently:

   ```js
   const Visitor = require('@swc/core/Visitor').default;

   class EmotionStyledTransformer extends Visitor {
     visitCallExpression(e) {
       // code
     }
   }

   const emotionPlugin = new EmotionStyledTransformer();

   module.exports = emotionPlugin;
   ```

2. Plugin does not work with `transformFile`, you need to use `transformFileSync` as alternative. Otherwise, it will give you weird `Unexpected token o in JSON` error. This is probably a mishandled logic problem in `@swc/core`, specifically in `parseFile` method (please do correct me if I am wrong here). It is actually doing `JSON.parse(<Promise>)` 👻

   ```js
   const { transformFileSync, plugins } = require('@swc/core');

   try {
     const result = transformFileSync(filename, {
       plugin: plugins([emotionPlugin.visitProgram.bind(emotionPlugin)]),
       ...swcOptions,
     });

     return result;
   } catch (error) {
     throw error;
   }
   ```

3. You might encounter error like `visitTsType method is not implemented`. I'm not sure about this, but it seems you can't use plugin together with a typescript file that specifies the typings.

### Sourcemaps path

This is seriously weird, since it uses node `path.relative` to determine the `sourceMappingURL`. But the path given is invalid, you can check this [issue](https://github.com/swc-project/cli/issues/21) I have opened in their CLI repository.

## Future

It seems Parcel is going to adopt SWC soon! You can view the [PR here](https://github.com/parcel-bundler/parcel/pull/6230), just in case it is merged or closed in the future.

Let's wait for the exciting future: **esbuild fully supports ES5 syntax transformations** or **SWC stabilization**.

## Conclusion

Well, it is how it is. SWC is more alpha version of Babel, so please be extra careful when migrating specifically a large codebase from Babel.

Despite having encoutered the issues above, this trial was quite fun, I also have discovered about hidden webpack spec that I wasn't aware of ✌️.

---
