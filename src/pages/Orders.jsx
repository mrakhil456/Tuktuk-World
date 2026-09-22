import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';

export default function Orders() {
  const { api } = useStore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get('/orders/my')
      .then(r => setOrders(r.data))
      .catch(() => setOrders([]));
  }, [api]);

  return (
    <section className="section">
      <span className="eyebrow">ORDER HISTORY</span>
      <h1>My orders</h1>

      {!orders.length ? (
        <div className="empty-state">
          <h2>No orders yet.</h2>
        </div>
      ) : (
        orders.map(o => (
          <div className="order-card" key={o._id}>
            <div className="box-head">
              <div>
                <b>Order #{o._id.slice(-8)}</b>
                <small>{new Date(o.createdAt).toLocaleString()}</small>
              </div>

              <span className="status">{o.status}</span>
            </div>

            <div className="order-items">
              {o.items.map((x, i) => (
                <div key={i}>
                  <span>
                    {x.name} × {x.qty}
                  </span>
                  <b>
                    ₹{(x.price * x.qty).toLocaleString('en-IN')}
                  </b>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>
                {o.paymentMethod} · {o.paymentStatus}
              </span>
              <strong>
                ₹{o.total.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        ))
      )}
    </section>
  );
}