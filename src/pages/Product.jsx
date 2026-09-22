import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const empty = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  stock: '',
  featured: false
};

export default function Admin() {
  const { api } = useStore();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);

  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const productFormRef = useRef(null);

  // =========================
  // LOAD ADMIN DATA
  // =========================
  const load = async () => {
    try {
      const [p, o, u, n] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/users'),
        api.get('/notifications')
      ]);

      setProducts(p.data);
      setOrders(o.data);
      setUsers(u.data);
      setNotes(n.data);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Unable to load admin data.'
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // OPEN ADD PRODUCT FORM
  // =========================
  const handleAddProduct = () => {
    console.log('Add new product clicked');

    setError('');
    setForm({ ...empty });
    setEditing(null);
    setShowForm(true);
  };

  // =========================
  // SCROLL TO PRODUCT FORM
  // =========================
  useEffect(() => {
    if (showForm && productFormRef.current) {
      setTimeout(() => {
        productFormRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [showForm]);

  // =========================
  // SAVE PRODUCT
  // =========================
  const saveProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        image: form.image.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        featured: Boolean(form.featured)
      };

      if (editing) {
        await api.put(
          `/products/${editing}`,
          payload
        );
      } else {
        await api.post(
          '/products',
          payload
        );
      }

      setForm({ ...empty });
      setEditing(null);
      setShowForm(false);

      await load();
    } catch (e) {
      console.error('Save product error:', e);

      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          'Unable to save product.'
      );
    }
  };

  // =========================
  // EDIT PRODUCT
  // =========================
  const edit = (p) => {
    setEditing(p._id);

    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price ?? '',
      category: p.category || '',
      image: p.image || '',
      stock: p.stock ?? '',
      featured: !!p.featured
    });

    setShowForm(true);
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const del = async (id) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    try {
      setError('');

      await api.delete(
        '/products/' + id
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Unable to delete product.'
      );
    }
  };

  // =========================
  // UPDATE ORDER STATUS
  // =========================
  const upd = async (id, status) => {
    try {
      setError('');

      await api.put(
        '/orders/' + id + '/status',
        { status }
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Unable to update order.'
      );
    }
  };

  // =========================
  // MARK NOTIFICATION READ
  // =========================
  const read = async (id) => {
    try {
      await api.patch(
        '/notifications/' + id + '/read'
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Unable to update notification.'
      );
    }
  };

  // =========================
  // STATS
  // =========================
  const unread = notes.filter(
    (n) => !n.read
  ).length;

  const revenue = orders
    .filter(
      (o) =>
        o.paymentStatus === 'PAID' ||
        o.paymentMethod === 'COD'
    )
    .reduce(
      (a, x) => a + Number(x.total || 0),
      0
    );

  // =========================
  // UI
  // =========================
  return (
    <section className="section admin-page">

      {/* =========================
          ADMIN TITLE
      ========================= */}
      <div className="admin-title">
        <div>
          <span className="eyebrow">
            CONTROL CENTER
          </span>

          <h1>Admin Dashboard</h1>
        </div>

        <button
          type="button"
          className="primary"
          onClick={handleAddProduct}
        >
          <Plus size={18} />
          Add new product
        </button>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {/* =========================
          STATS
      ========================= */}
      <div className="stats">
        <div>
          <small>Products</small>
          <b>{products.length}</b>
        </div>

        <div>
          <small>Users</small>
          <b>{users.length}</b>
        </div>

        <div>
          <small>Orders</small>
          <b>{orders.length}</b>
        </div>

        <div>
          <small>Revenue</small>
          <b>
            ₹{revenue.toLocaleString('en-IN')}
          </b>
        </div>
      </div>

      {/* =================================================
          ADD / EDIT PRODUCT FORM
          THIS IS NOW DIRECTLY AFTER THE STATS
      ================================================= */}
      {showForm && (
        <div
          ref={productFormRef}
          className="adminbox product-form-box"
        >
          <div className="box-head">
            <h2>
              {editing
                ? 'Edit product'
                : 'Add new product'}
            </h2>
          </div>

          <form
            className="product-form"
            onSubmit={saveProduct}
          >

            {/* PRODUCT NAME */}
            <input
              required
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />

            {/* CATEGORY */}
            <input
              required
              type="text"
              placeholder="Category (e.g. Dog Food)"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value
                })
              }
            />

            {/* PRICE */}
            <input
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value
                })
              }
            />

            {/* STOCK */}
            <input
              required
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: e.target.value
                })
              }
            />

            {/* IMAGE */}
            <input
              required
              type="text"
              className="wide"
              placeholder="Product image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.value
                })
              }
            />

            {/* DESCRIPTION */}
            <textarea
              className="wide"
              placeholder="Product description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />

            {/* FEATURED */}
            <label className="check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({
                    ...form,
                    featured: e.target.checked
                  })
                }
              />

              Featured product
            </label>

            {/* BUTTONS */}
            <div className="form-actions">

              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm({ ...empty });
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
              >
                {editing
                  ? 'Update product'
                  : 'Create product'}
              </button>

            </div>
          </form>
        </div>
      )}

      {/* =========================
          ADMIN MESSAGES
      ========================= */}
      <div className="adminbox notifications">

        <div className="box-head">
          <h2>
            <Bell size={20} />
            Admin messages
          </h2>

          <span
            className={
              unread
                ? 'badge unread'
                : 'badge'
            }
          >
            {unread} unread
          </span>
        </div>

        {!notes.length ? (
          <p className="muted">
            No admin messages yet. New COD
            orders will appear here.
          </p>
        ) : (
          notes.map((n) => (
            <div
              className={
                n.read
                  ? 'notification'
                  : 'notification unread-note'
              }
              key={n._id}
            >

              <div>
                <b>{n.title}</b>

                <p>
                  {n.message}
                </p>

                <small>
                  {new Date(
                    n.createdAt
                  ).toLocaleString()}
                </small>
              </div>

              {!n.read && (
                <button
                  type="button"
                  className="small-btn"
                  onClick={() =>
                    read(n._id)
                  }
                >
                  <Check size={15} />
                  Mark read
                </button>
              )}

            </div>
          ))
        )}

      </div>

      {/* =========================
          PRODUCTS
      ========================= */}
      <div className="adminbox">

        <div className="box-head">
          <h2>Products</h2>

          <span>
            {products.length} total
          </span>
        </div>

        {!products.length ? (
          <p className="muted">
            No products available.
          </p>
        ) : (
          products.map((x) => (
            <div
              className="row"
              key={x._id}
            >

              <div className="admin-product">

                <img
                  src={x.image}
                  alt={x.name || 'Product'}
                />

                <span>
                  <b>{x.name}</b>

                  <small>
                    {x.category} · Stock {x.stock}
                  </small>
                </span>

              </div>

              <strong>
                ₹{Number(
                  x.price || 0
                ).toLocaleString('en-IN')}
              </strong>

              <button
                type="button"
                className="small-btn"
                onClick={() => edit(x)}
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                type="button"
                className="danger-btn"
                onClick={() =>
                  del(x._id)
                }
              >
                <Trash2 size={15} />
                Delete
              </button>

            </div>
          ))
        )}

      </div>

      {/* =========================
          ORDERS
      ========================= */}
      <div className="adminbox">

        <div className="box-head">
          <h2>Orders</h2>

          <span>
            {orders.length} total
          </span>
        </div>

        {!orders.length ? (
          <p className="muted">
            No orders available.
          </p>
        ) : (
          orders.map((x) => (
            <div
              className="row"
              key={x._id}
            >

              <span>
                <b>
                  #{x._id.slice(-8)}
                </b>{' '}
                —{' '}
                {x.user?.name ||
                  'Customer'}

                <small>
                  {x.paymentMethod} ·{' '}
                  {x.paymentStatus}
                </small>
              </span>

              <strong>
                ₹{Number(
                  x.total || 0
                ).toLocaleString('en-IN')}
              </strong>

              <select
                value={x.status}
                onChange={(e) =>
                  upd(
                    x._id,
                    e.target.value
                  )
                }
              >
                <option value="PLACED">
                  PLACED
                </option>

                <option value="PROCESSING">
                  PROCESSING
                </option>

                <option value="SHIPPED">
                  SHIPPED
                </option>

                <option value="DELIVERED">
                  DELIVERED
                </option>

                <option value="CANCELLED">
                  CANCELLED
                </option>
              </select>

            </div>
          ))
        )}

      </div>

    </section>
  );
}