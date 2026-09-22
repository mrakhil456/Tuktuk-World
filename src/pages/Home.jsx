import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { api } = useStore();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then(r => setProducts(r.data))
      .catch(() => {});
  }, [api]);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">WELCOME TO TUKTUK WORLD</span>

          <h1>
            Shop happy. <span>Care better.</span>
          </h1>

          <p>
            Discover food, toys, accessories and everyday essentials
            for the pets you love.
          </p>

          <div className="hero-actions">
            <Link className="primary" to="/shop">
              Shop all products <ArrowRight size={18} />
            </Link>

            <Link className="secondary" to="/register">
              Create account
            </Link>
          </div>

          <div className="hero-trust">
            <span>
              <ShieldCheck size={18} /> Secure checkout
            </span>

            <span>
              <Truck size={18} /> Reliable delivery
            </span>

            <span>
              <CreditCard size={18} /> COD + Online
            </span>
          </div>
        </div>

        <div className="hero-image-wrap">
          <img
            src="/tuktuk-hero.jpg"
            alt="Tuktuk World dog and cat in a colorful auto rickshaw"
            className="hero-image"
          />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">JUST FOR YOU</span>
            <h2>Featured products</h2>
          </div>

          <Link to="/shop">
            View all <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid">
          {products
            .slice(0, 4)
            .map(x => (
              <ProductCard key={x._id} p={x} />
            ))}
        </div>
      </section>
    </>
  );
}