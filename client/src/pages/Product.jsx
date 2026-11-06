import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

const getProducts = (response) => {
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  throw new Error('Unexpected products response.');
};

export default function Product() {
  const { id } = useParams();
  const { api, add, user } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        setProduct(null);
        setAdded(false);

        const response = await api.get(`/products/${id}`);

        if (active) {
          setProduct(response.data?.product || response.data);
        }
      } catch (err) {
        console.error('Product loading error:', err);

        if (active) {
          setError(
            err.response?.data?.message ||
            'Unable to load product details.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id, api]);

  useEffect(() => {
    if (!product?._id) {
      setRelatedProducts([]);
      return undefined;
    }

    let active = true;

    const fetchRelatedProducts = async () => {
      try {
        setRelatedLoading(true);
        setRelatedError('');

        const response = await api.get('/products');
        const products = getProducts(response).filter(
          (item) => String(item._id) !== String(product._id)
        );
        const category = String(product.category || '').trim().toLowerCase();
        const matchingCategory = category
          ? products.filter(
              (item) =>
                String(item.category || '').trim().toLowerCase() === category
            )
          : [];
        const recommendations = [
          ...matchingCategory,
          ...products.filter((item) => !matchingCategory.includes(item))
        ].slice(0, 4);

        if (active) {
          setRelatedProducts(recommendations);
        }
      } catch (err) {
        console.error('Related products loading error:', err);

        if (active) {
          setRelatedError('Related products are unavailable right now.');
        }
      } finally {
        if (active) {
          setRelatedLoading(false);
        }
      }
    };

    fetchRelatedProducts();

    return () => {
      active = false;
    };
  }, [api, product]);

  if (loading) {
    return (
      <section className="section">
        <p className="muted">Loading product details...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="section">
        <h2>Product not found</h2>

        <p className="error">
          {error || 'This product is not available.'}
        </p>

        <Link to="/shop" className="secondary">
          <ArrowLeft size={17} />
          Back to Shop
        </Link>
      </section>
    );
  }

  const inStock = Number(product.stock) > 0;
  const adminUser = user?.role === 'admin';

  return (
    <>
      <section className="product">
        <img
          className="product-image"
          src={product.image}
          alt={product.name || 'Product image'}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />

        <div className="product-info">
          <Link to="/shop" className="back">
            <ArrowLeft size={17} />
            Back to Shop
          </Link>

          <span className="eyebrow">
            {product.category || 'PET ESSENTIALS'}
          </span>

          <h1>{product.name}</h1>

          <div className="big-price">
            ₹{Number(product.price || 0).toLocaleString('en-IN')}
          </div>

          <p className="product-description">
            {product.description || 'Quality product from Tuktuk World.'}
          </p>

          <p className={`product-stock ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock
              ? `${product.stock} items available`
              : 'Currently out of stock'}
          </p>

          <button
            type="button"
            className="primary product-add"
            disabled={!inStock || adminUser}
            onClick={() => {
              add(product);
              setAdded(true);
            }}
          >
            <ShoppingCart size={19} />
            {adminUser
              ? 'Customer cart unavailable to admins'
              : inStock
                ? added
                  ? 'Add another'
                  : 'Add to Cart'
                : 'Out of Stock'}
          </button>

          {added && (
            <p className="product-added" role="status" aria-live="polite">
              Added to your cart. <Link to="/cart">View cart</Link>
            </p>
          )}
        </div>
      </section>

      <section className="section related-products" aria-labelledby="related-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MORE TO LOVE</span>
            <h2 id="related-title">You may also like</h2>
          </div>
          <Link to="/shop">
            View all products <ArrowRight size={17} />
          </Link>
        </div>

        {relatedLoading ? (
          <p className="muted" role="status">Finding products for you...</p>
        ) : relatedError ? (
          <p className="error" role="alert">{relatedError}</p>
        ) : relatedProducts.length ? (
          <div className="grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} p={item} />
            ))}
          </div>
        ) : (
          <p className="muted">No other products are available yet.</p>
        )}
      </section>
    </>
  );
}