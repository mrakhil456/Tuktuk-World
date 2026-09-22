import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const { api } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    api
      .get('/products')
      .then(r => setProducts(r.data))
      .catch(() => setProducts([]));
  }, [api]);

  useEffect(() => {
    setQ(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  const cats = [
    'All',
    ...Array.from(
      new Set(products.map(p => p.category).filter(Boolean))
    )
  ];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    let list = products.filter(p => {
      const s = `${p.name} ${p.category} ${p.description || ''}`.toLowerCase();

      return (
        (!needle || s.includes(needle)) &&
        (category === 'All' || p.category === category)
      );
    });

    if (sort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    }

    if (sort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    }

    if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, q, category, sort]);

  const submit = e => {
    e.preventDefault();

    navigate(
      `/shop${
        q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
      }`
    );
  };

  return (
    <section className="section">
      <div className="shop-head">
        <div>
          <span className="eyebrow">TUKTUK STORE</span>
          <h1>Shop all products</h1>
          <p>
            {filtered.length} product
            {filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <form className="shop-search" onSubmit={submit}>
        <Search size={19} />

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by product name, category or description..."
        />

        <button className="primary" type="submit">
          Search
        </button>
      </form>

      <div className="filters">
        <div className="category-pills">
          {cats.map(c => (
            <button
              key={c}
              className={category === c ? 'active' : ''}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <label>
          <SlidersHorizontal size={16} />
          Sort

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="grid">
          {filtered.map(x => (
            <ProductCard key={x._id} p={x} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Try a different search term or category.</p>
        </div>
      )}
    </section>
  );
}