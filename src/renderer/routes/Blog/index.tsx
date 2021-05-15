import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { getDocBySlug } from '@lib/docs';
import './styles.scss';
import './prism.css';

function BlogPage() {
  const params: any = useParams();
  const { meta, html } = getDocBySlug(params.slug);

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta content={meta.description} name="description" />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
      </Helmet>
      <main className="main-container">
        <article
          className="articleContainer"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </>
  );
}

export default BlogPage;
