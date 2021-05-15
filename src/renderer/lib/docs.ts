import * as blogs from '../blogs';
import type { Blog } from '@interfaces/blogs';

let searchEngine;

export function getDocBySlug(slug: string) {
  return blogs[blogs.ENUM_EXPORT[slug]];
}

export function getAllBlogs(): Blog[] {
  const docs = Object.keys(blogs.ENUM_EXPORT).reduce((array, slug) => {
    const blog = getDocBySlug(slug);

    array.push(blog);

    return array;
  }, []);

  return docs;
}

export function searchBlog(search: string) {
  if (!searchEngine) {
    const Fuse = require('fuse.js');

    const options = {
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      ignoreLocation: true,
      keys: ['meta.title', 'meta.description', 'slug'],
    };

    searchEngine = new Fuse(getAllBlogs(), options);
  }

  return searchEngine.search(search);
}
