import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ p }) {
  const { add } = useStore();

  return (
    <article className="card">
      <Link to={`/product/${p._id}`}>
        <img src={p.image} alt={p.name} />
      </Link>

      <div className="card-body">
        <small>{p.category}</small>

        <h3>
          <Link to={`/product/${p._id}`}>
            {p.name}
          </Link>
        </h3>

        <p className="card-desc">
          {p.description || 'Quality product from Tuktuk World.'}
        </p>

        <div className="card-bottom">
          <strong>
            ₹{Number(p.price).toLocaleString('en-IN')}
          </strong>

          <span>
            {p.stock > 0
              ? `${p.stock} in stock`
              : 'Out of stock'}
          </span>
        </div>

        <button
          disabled={!p.stock}
          onClick={() => add(p)}
        >
          <ShoppingCart size={17} />
          {p.stock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </article>
  );
}