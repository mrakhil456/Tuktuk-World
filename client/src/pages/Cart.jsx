import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Cart() {
  const { cart, setCart } = useStore();

  const total = cart.reduce(
    (a, x) => a + x.price * x.qty,
    0
  );

  const updateQty = (id, d) =>
    setCart(
      cart.map(x =>
        x.product === id
          ? {
              ...x,
              qty: Math.max(1, x.qty + d)
            }
          : x
      )
    );

  const remove = id =>
    setCart(
      cart.filter(x => x.product !== id)
    );

  return (
    <section className="section cart-page">
      <span className="eyebrow">YOUR BAG</span>

      <h1>Shopping cart</h1>

      {!cart.length ? (
        <div className="empty-state">
          <h2>Your cart is empty.</h2>

          <Link className="primary" to="/shop">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.map(x => (
              <div
                className="cartitem"
                key={x.product}
              >
                <img
                  src={x.image}
                  alt={x.name}
                />

                <div className="cart-info">
                  <h3>{x.name}</h3>

                  <p>
                    ₹{Number(x.price).toLocaleString('en-IN')} each
                  </p>
                </div>

                <div className="qty">
                  <button
                    onClick={() =>
                      updateQty(x.product, -1)
                    }
                  >
                    <Minus size={15} />
                  </button>

                  <b>{x.qty}</b>

                  <button
                    onClick={() =>
                      updateQty(x.product, 1)
                    }
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <strong>
                  ₹{(x.price * x.qty).toLocaleString('en-IN')}
                </strong>

                <button
                  className="icon-btn"
                  onClick={() =>
                    remove(x.product)
                  }
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <aside className="summary">
            <h2>Order summary</h2>

            <div>
              <span>Subtotal</span>
              <b>
                ₹{total.toLocaleString('en-IN')}
              </b>
            </div>

            <div>
              <span>Delivery</span>
              <b>Free</b>
            </div>

            <hr />

            <div className="grand">
              <span>Total</span>
              <b>
                ₹{total.toLocaleString('en-IN')}
              </b>
            </div>

            <Link
              className="primary full"
              to="/checkout"
            >
              Proceed to payment <ArrowRight size={18} />
            </Link>

            <p className="muted">
              Choose Cash on Delivery or secure online payment at checkout.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}