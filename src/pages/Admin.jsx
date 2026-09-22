import React, { useEffect, useState } from 'react';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Check,
  Upload,
  X
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

  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  /* =========================
     LOAD ADMIN DATA
  ========================= */

  const load = async () => {
    try {
      const [p, o, u, n] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/users'),
        api.get('/notifications')
      ]);

      setProducts(p.data || []);
      setOrders(o.data || []);
      setUsers(u.data || []);
      setNotes(n.data || []);
    } catch (e) {
      console.error('Admin load error:', e);

      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          'Unable to load admin data.'
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =========================
     ADD PRODUCT
  ========================= */

  const handleAddProduct = () => {
    setError('');
    setEditing(null);
    setForm({ ...empty });
    setImagePreview('');
    setShowForm(true);
  };

  /* =========================
     CANCEL FORM
  ========================= */

  const handleCancelForm = () => {
    setError('');
    setEditing(null);
    setForm({ ...empty });
    setImagePreview('');
    setShowForm(false);
  };

  /* =========================
     IMAGE SELECT
  ========================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');

    /* Maximum file size: 5 MB */
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.');
      e.target.value = '';
      return;
    }

    /* Only image files */
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      setForm((prev) => ({
        ...prev,
        image: result
      }));

      setImagePreview(result);
      setUploadingImage(false);
    };

    reader.onerror = () => {
      setError('Unable to read the selected image.');
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  /* =========================
     REMOVE / CLEAR IMAGE
  ========================= */

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      image: ''
    }));

    setImagePreview('');
  };

  /* =========================
     SAVE PRODUCT
  ========================= */

  const saveProduct = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const name = form.name.trim();
      const description = form.description.trim();
      const category = form.category.trim();
      const price = Number(form.price);
      const stock = Number(form.stock);

      /* Validation */

      if (!name) {
        setError('Product name is required.');
        return;
      }

      if (!category) {
        setError('Category is required.');
        return;
      }

      if (!form.image) {
        setError('Please select a product image.');
        return;
      }

      if (Number.isNaN(price) || price < 0) {
        setError('Please enter a valid price.');
        return;
      }

      if (Number.isNaN(stock) || stock < 0) {
        setError('Please enter a valid stock quantity.');
        return;
      }

      const payload = {
        name,
        description,
        price,
        category,
        image: form.image,
        stock,
        featured: Boolean(form.featured)
      };

      /* Update existing product */

      if (editing) {
        await api.put(
          `/products/${editing}`,
          payload
        );
      }

      /* Create new product */

      else {
        await api.post(
          '/products',
          payload
        );
      }

      /* Reset */

      setForm({ ...empty });
      setEditing(null);
      setImagePreview('');
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

  /* =========================
     EDIT PRODUCT
  ========================= */

  const edit = (product) => {
    setError('');
    setEditing(product._id);

    const existingImage = product.image || '';

    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || '',
      image: existingImage,
      stock: product.stock ?? '',
      featured: Boolean(product.featured)
    });

    setImagePreview(existingImage);

    setShowForm(true);
  };

  /* =========================
     DELETE PRODUCT
  ========================= */

  const del = async (id) => {
    const confirmed = window.confirm(
      'Delete this product?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await api.delete(
        '/products/' + id
      );

      await load();
    } catch (e) {
      console.error(
        'Delete product error:',
        e
      );

      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          'Unable to delete product.'
      );
    }
  };

  /* =========================
     UPDATE ORDER STATUS
  ========================= */

  const upd = async (id, status) => {
    try {
      setError('');

      await api.put(
        '/orders/' + id + '/status',
        { status }
      );

      await load();
    } catch (e) {
      console.error(
        'Order update error:',
        e
      );

      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          'Unable to update order.'
      );
    }
  };

  /* =========================
     MARK NOTIFICATION READ
  ========================= */

  const read = async (id) => {
    try {
      setError('');

      await api.patch(
        '/notifications/' + id + '/read'
      );

      await load();
    } catch (e) {
      console.error(
        'Notification update error:',
        e
      );

      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          'Unable to update notification.'
      );
    }
  };

  /* =========================
     STATISTICS
  ========================= */

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
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

  /* =====================================================
     ADD / EDIT PRODUCT SCREEN
  ===================================================== */

  if (showForm) {
    return (
      <section className="section admin-page">

        {/* PAGE HEADER */}

        <div className="admin-title">
          <div>
            <span className="eyebrow">
              CONTROL CENTER
            </span>

            <h1>
              {editing
                ? 'Edit Product'
                : 'Add New Product'}
            </h1>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={handleCancelForm}
          >
            <X size={18} />
            Cancel
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {/* PRODUCT FORM */}

        <div className="adminbox product-form-box">

          <div className="box-head">
            <h2>
              {editing
                ? 'Edit product'
                : 'Create new product'}
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

            {/* IMAGE UPLOAD */}

            <div className="image-upload-box wide">

              <label
                htmlFor="product-image"
                className="image-upload-label"
              >
                <Upload size={20} />

                <span>
                  {editing
                    ? 'Change product image'
                    : 'Choose product image'}
                </span>

                <small>
                  JPG, JPEG, PNG or WEBP · Max 5 MB
                </small>
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
              />

              {uploadingImage && (
                <p className="muted">
                  Processing image...
                </p>
              )}

              {/* IMAGE PREVIEW */}

              {imagePreview && (
                <div className="image-preview">

                  <img
                    src={imagePreview}
                    alt="Product preview"
                  />

                  <button
                    type="button"
                    className="danger-btn"
                    onClick={removeImage}
                  >
                    <Trash2 size={15} />
                    Remove image
                  </button>

                </div>
              )}

            </div>

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

            {/* FORM ACTIONS */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary"
                onClick={handleCancelForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
                disabled={uploadingImage}
              >
                {editing
                  ? 'Update product'
                  : 'Create product'}
              </button>

            </div>

          </form>

        </div>

      </section>
    );
  }

  /* =====================================================
     ADMIN DASHBOARD
  ===================================================== */

  return (
    <section className="section admin-page">

      {/* HEADER */}

      <div className="admin-title">

        <div>
          <span className="eyebrow">
            CONTROL CENTER
          </span>

          <h1>
            Admin Dashboard
          </h1>
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

      {/* ERROR */}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="stats">

        <div>
          <small>
            Products
          </small>

          <b>
            {products.length}
          </b>
        </div>

        <div>
          <small>
            Users
          </small>

          <b>
            {users.length}
          </b>
        </div>

        <div>
          <small>
            Orders
          </small>

          <b>
            {orders.length}
          </b>
        </div>

        <div>
          <small>
            Revenue
          </small>

          <b>
            ₹{revenue.toLocaleString('en-IN')}
          </b>
        </div>

      </div>

      {/* =========================
          NOTIFICATIONS
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
            No admin messages yet.
            New COD orders will appear here.
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

                <b>
                  {n.title}
                </b>

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

          <h2>
            Products
          </h2>

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

                  <b>
                    {x.name}
                  </b>

                  <small>
                    {x.category} · Stock {x.stock}
                  </small>

                </span>

              </div>

              <strong>
                ₹
                {Number(
                  x.price || 0
                ).toLocaleString('en-IN')}
              </strong>

              {/* EDIT */}

              <button
                type="button"
                className="small-btn"
                onClick={() =>
                  edit(x)
                }
              >
                <Pencil size={15} />
                Edit
              </button>

              {/* DELETE */}

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

          <h2>
            Orders
          </h2>

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
                </b>

                {' — '}

                {x.user?.name ||
                  'Customer'}

                <small>
                  {x.paymentMethod} ·{' '}
                  {x.paymentStatus}
                </small>

              </span>

              <strong>
                ₹
                {Number(
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