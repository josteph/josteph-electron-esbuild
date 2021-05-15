const path = require('path');
const fs = require('fs-extra');
const { TextDecoder } = require('util');

// Remark plugins
const matter = require('gray-matter');
const remark = require('remark');
const html = require('remark-html');
const prism = require('remark-prism');
const slug = require('remark-slug');
const toc = require('remark-toc');
const autolink = require('remark-autolink-headings');
const hint = require('remark-hint');
const externalLinks = require('remark-external-links');

async function remarkTransform(contents) {
  const result = await remark()
    .use(slug)
    .use(toc)
    .use(autolink, {
      behavior: 'append',
      content: {
        type: 'element',
        tagName: 'span',
        properties: { className: ['icon', 'icon-link'] },
        children: [{ type: 'text', value: '🔗' }],
      },
    })
    .use(hint)
    .use(externalLinks)
    .use(html)
    .use(prism)
    .process(contents);

  return result.toString();
};

function remarkPlugin() {
  return {
    name: 'md-remark',
    setup(build) {
      build.onResolve({ filter: /\.md$/ }, (args) => {
        if (args.resolveDir === '') return;

        return {
          path: path.isAbsolute(args.path)
            ? args.path
            : path.join(args.resolveDir, args.path),
          namespace: 'markdown'
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'markdown' }, async args => {
        const markdownContent = new TextDecoder().decode(await fs.readFile(args.path));

        const { data: meta, content: raw } = matter(markdownContent);

        const finalContents = await remarkTransform(raw);

        return {
          loader: 'json',
          contents: JSON.stringify({
            meta,
            raw,
            html: finalContents,
            slug: path.basename(args.path, '.md'),
          }),
        };
      });
    },
  }
}

module.exports = remarkPlugin;
