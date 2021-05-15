import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchBlog } from '@lib/docs';
import './styles.scss';

const Searchbar = () => {
  const [search, setSearch] = useState('');
  const [showSearchResult, setShowSearchResult] = useState(false);

  useEffect(() => {
    setShowSearchResult(Boolean(search));
  }, [search]);

  const handleSetSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleResetSearch = () => {
    setSearch('');
  };

  const result = search ? searchBlog(search) : [];

  return (
    <header className="stySearchbarContainer">
      <Link to="/">Josteph</Link>

      <input
        value={search}
        id="search-input"
        onChange={handleSetSearch}
        onFocus={() => setShowSearchResult(Boolean(search))}
        type="text"
        placeholder="Search blog"
      />

      {search && showSearchResult && (
        <div className="stySearchResult">
          {result.length > 0 && (
            <div>
              {result.length} result(s) found{' '}
              <span aria-label="" role="img">
                🎉
              </span>
            </div>
          )}
          <ul>
            {result.length > 0 ? (
              result.map((r) => (
                <li key={r.refIndex}>
                  <Link
                    to={`/blog/${r.item.slug}`}
                    className="ani-link color-normal"
                    onClick={handleResetSearch}
                  >
                    {r.item.meta.title}
                  </Link>
                </li>
              ))
            ) : (
              <li>
                No result found{' '}
                <span aria-label="sad" role="img">
                  😞
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Searchbar;
