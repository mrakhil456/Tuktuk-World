import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  Banknote,
  Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const loadRazorpay = () =>
  new Promise(resolve => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }

    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function Checkout() {
  const { api, cart, user, setCart } = useStore();
  const navigate = useNavigate();

  const [method, setMethod] = useState('COD');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [address, setAddress] = useState({
    name: '',
    mobile: '',
    line1: '',
    city: '',
    state: 'Uttar Pradesh',
    pincode: ''
  });

  const total = cart.reduce((a, x) => a + x.price * x.qty, 0);

  useEffect(() => {
    if (user) {
      setAddress(a => ({
        ...a,
        name: a.name || user.name,
        mobile: a.mobile || user.mobile
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!cart.length) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, navigate]);

  const validate = () => {
    if (
      !address.name ||
      !address.mobile ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !/^\d{6}$/.test(address.pincode)
    ) {
      setError(
        'Please complete the delivery address and enter a valid 6-digit PIN code.'
      );
      return false;
    }

    return true;
  };

  const items = cart.map(x => ({
    product: x.product,
    name: x.name,
    price: x.price,
    qty: x.qty,
    image: x.image
  }));

  const placeCod = async () => {
    const r = await api.post('/orders/cod', {
      items,
      total,
      shippingAddress: address
    });

    setCart([]);

    alert(
      `Order placed successfully! Order #${r.data._id.slice(
        -8
      )}. The admin has been notified.`
    );

    navigate('/orders');
  };

  const payOnline = async () => {
    const loaded = await loadRazorpay();

    if (!loaded) {
      throw Error('Unable to load the online payment gateway.');
    }

    const created = await api.post('/orders/online/create', {
      items,
      total,
      shippingAddress: address
    });

    const order = created.data;

    const options = {
      key:
        import.meta.env.VITE_RAZORPAY_KEY_ID || order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Tuktuk World',
      description: 'Tuktuk World purchase',
      order_id: order.razorpayOrderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.mobile
      },
      theme: {
        color: '#126b3a'
      },
      handler: async response => {
        try {
          await api.post('/orders/online/verify', {
            orderId: order.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          setCart([]);
          alert(
            'Online payment successful! Your order has been confirmed.'
          );
          navigate('/orders');
        } catch (e) {
          setError(
            e.response?.data?.message || 'Payment verification failed.'
          );
          setBusy(false);
        }
      },
      modal: {
        ondismiss: () => setBusy(false)
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', r => {
      setError(r.error?.description || 'Payment failed.');
      setBusy(false);
    });

    rzp.open();
  };

  const submit = async e => {
    e.preventDefault();
    setError('');

    if (!validate() || !cart.length) return;

    setBusy(true);

    try {
      if (method === 'COD') {
        await placeCod();
      } else {
        await payOnline();
      }
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Unable to place the order.'
      );
      setBusy(false);
    }
  };

  return (
    <section className="section checkout-page">
      <span className="eyebrow">CHECKOUT</span>
      <h1>Delivery & payment</h1>

      {!user ? (
        <div className="login-required">
          <div className="login-required-icon">🔐</div>
          <h2>Please login before placing your order</h2>
          <p>
            You can browse products and add them to your cart without
            logging in, but you must login before placing an order. Use
            email & password or mobile OTP.
          </p>

          <div className="login-required-actions">
            <button
              className="primary"
              onClick={() => navigate('/login?redirect=/checkout')}
            >
              Login to continue
            </button>

            <Link
              className="secondary"
              to="/register?redirect=/checkout"
            >
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <h2>Delivery address</h2>

            <div className="form-grid">
              <input
                required
                placeholder="Full name"
                value={address.name}
                onChange={e =>
                  setAddress({
                    ...address,
                    name: e.target.value
                  })
                }
              />

              <input
                required
                placeholder="Mobile number"
                value={address.mobile}
                onChange={e =>
                  setAddress({
                    ...address,
                    mobile: e.target.value
                  })
                }
              />

              <input
                required
                className="wide"
                placeholder="House / street / area"
                value={address.line1}
                onChange={e =>
                  setAddress({
                    ...address,
                    line1: e.target.value
                  })
                }
              />

              <input
                required
                placeholder="City"
                value={address.city}
                onChange={e =>
                  setAddress({
                    ...address,
                    city: e.target.value
                  })
                }
              />

              <input
                required
                placeholder="State"
                value={address.state}
                onChange={e =>
                  setAddress({
                    ...address,
                    state: e.target.value
                  })
                }
              />

              <input
                required
                inputMode="numeric"
                maxLength="6"
                placeholder="PIN code"
                value={address.pincode}
                onChange={e =>
                  setAddress({
                    ...address,
                    pincode: e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  })
                }
              />
            </div>

            <h2>Payment method</h2>

            <div className="payment-options">
              <button
                type="button"
                className={
                  method === 'COD'
                    ? 'payment-option selected'
                    : 'payment-option'
                }
                onClick={() => setMethod('COD')}
              >
                <Banknote />

                <span>
                  <b>Cash on Delivery</b>
                  <small>
                    Place order now and pay when delivered.
                  </small>
                </span>

                {method === 'COD' && <CheckCircle2 />}
              </button>

              <button
                type="button"
                className={
                  method === 'ONLINE'
                    ? 'payment-option selected'
                    : 'payment-option'
                }
                onClick={() => setMethod('ONLINE')}
              >
                <CreditCard />

                <span>
                  <b>Online Payment</b>
                  <small>
                    Pay securely using Razorpay.
                  </small>
                </span>

                {method === 'ONLINE' && <CheckCircle2 />}
              </button>
            </div>

            {method === 'ONLINE' && (
              <div className="info-note">
                Online payment requires Razorpay credentials in
                server/.env and client/.env.
              </div>
            )}

            {error && <p className="error">{error}</p>}

            <button
              className="primary full"
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 className="spin" />
                  Processing...
                </>
              ) : method === 'COD' ? (
                'Place COD order'
              ) : (
                'Proceed to secure payment'
              )}
            </button>
          </form>

          <aside className="summary">
            <h2>Your order</h2>

            {cart.map(x => (
              <div className="mini-item" key={x.product}>
                <span>
                  {x.name} × {x.qty}
                </span>
                <b>
                  ₹{(x.price * x.qty).toLocaleString('en-IN')}
                </b>
              </div>
            ))}

            <hr />

            <div className="grand">
              <span>Total</span>
              <b>₹{total.toLocaleString('en-IN')}</b>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}