'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BrandKey } from '@/lib/types';

export type SearchableBranch = {
  id: string;
  name: string;
  brand: BrandKey;
  brandName: string;
  sido: string;
  sigungu: string;
  path: string;
  specialScreens: string[];
};

const QUICK_KEYWORDS = ['용산', '강남', '코엑스', '월드타워', '센텀', '수원', 'IMAX', '돌비'];

export default function BranchQuickSearch({ items }: { items: SearchableBranch[] }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((item) => {
        const target = `${item.name} ${item.brandName} ${item.sido} ${item.sigungu} ${item.specialScreens.join(' ')}`.toLowerCase();
        return target.includes(q);
      })
      .slice(0, 8);
  }, [items, query]);

  return (
    <div className="quick-search-shell">
      <div className="quick-search-bar">
        <svg
          className="quick-search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          className="quick-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="지점, 지역, 특별관 이름으로 찾기"
          aria-label="영화관 지점 빠른 검색"
        />
        {query && (
          <button
            type="button"
            className="quick-search-clear"
            onClick={() => setQuery('')}
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      <div className="quick-search-tags" aria-label="자주 찾는 곳">
        <span className="quick-search-tags-label">자주 찾는 곳</span>
        {QUICK_KEYWORDS.map((kw) => (
          <button
            key={kw}
            type="button"
            className={`quick-tag-btn${query === kw ? ' is-active' : ''}`}
            onClick={() => setQuery(query === kw ? '' : kw)}
          >
            {kw}
          </button>
        ))}
      </div>

      {query.trim() !== '' && (
        <div className="quick-search-results" role="region" aria-label="검색 결과">
          {results.length === 0 ? (
            <p className="quick-search-empty">
              &lsquo;{query}&rsquo; 검색 결과가 없습니다. 지점 이름이나 시·구 이름으로 찾아 보세요.
            </p>
          ) : (
            <ul className="quick-search-list">
              {results.map((r) => (
                <li key={r.id}>
                  <Link href={r.path} className="quick-search-item">
                    <div className="quick-search-item-main">
                      <span className={`quick-brand-pill quick-brand-pill--${r.brand}`}>
                        {r.brandName}
                      </span>
                      <strong className="quick-search-name">{r.name}</strong>
                      <span className="quick-search-region">
                        {r.sido} {r.sigungu}
                      </span>
                    </div>
                    <div className="quick-search-item-meta">
                      {r.specialScreens.length > 0 ? (
                        <span className="quick-search-screens">
                          {r.specialScreens.slice(0, 3).join(' · ')}
                        </span>
                      ) : (
                        <span className="quick-search-screens is-normal">일반관</span>
                      )}
                      <span className="quick-search-arrow" aria-hidden="true">
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
