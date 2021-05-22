import React, { useEffect } from 'react';
import { GitHub, Twitter, Linkedin } from 'react-feather';
import { Link } from 'react-router-dom';
import type { Blog } from '@interfaces/blogs';
import { getAllBlogs } from '@lib/docs';
import { init as initSocket } from '@lib/socket';
import { MESSAGE_ENUM } from '@shared/constants';
import './styles.scss';

const docs = getAllBlogs();

const HomePage = () => {
  useEffect(() => {
    const ws = initSocket();

    if (!ws) {
      return undefined;
    }

    const interval = setInterval(() => {
      const msg = {
        type: MESSAGE_ENUM.START_FETCH,
        url: 'https://jsonplaceholder.typicode.com/todos/1',
      };

      ws.send(JSON.stringify(msg));
    }, 5000);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  return (
    <main>
      <section className="main-container">
        <div className="styMainInfo">
          <h3>
            Hi, I am <span className="main-gradient">Joshua</span>
          </h3>
          <br />
          <h4 className="main-gradient">
            Software Engineer
            <br />
            Web Platform
          </h4>
          <p>
            Pleased to meet you!
            <br />
            I mainly deal with Javascript and stuffs related with web.
            <br />
            Currently building great stuffs with the awesome team at{' '}
            <a href="https://www.tokopedia.com">Tokopedia</a>.
            <br />
            <br />
            Feel free to reach me anytime to have a nice chat together 🍻
          </p>
        </div>
        <div className="styMainInfo styContactInfo">
          <h4 className="main-gradient">Get In Touch</h4>
          <div>
            <p>
              The universe is a pretty big place.
              <br />
              You can find me on:
            </p>
            <ul>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://www.linkedin.com/in/josteph22/"
                >
                  <Linkedin /> @josteph22
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://github.com/josteph"
                >
                  <GitHub /> @josteph
                </a>
              </li>
              <li>
                <a
                  target="_blank"
                  rel="noreferrer noopener"
                  href="https://twitter.com/jostephhh"
                >
                  <Twitter /> @jostephhh
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <hr />

      <section className="styBlogInfo">
        <h2>Blog</h2>

        {docs.map((doc: Blog) => (
          <div className="styBlogDisplay" key={doc.slug}>
            <h3>
              <Link to={`/blog/${doc.slug}`} className="ani-link color-normal">
                {doc.meta.title}
              </Link>
            </h3>
            <p className="font-sm">{doc.meta.published}</p>
            <p>{doc.meta.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default HomePage;
