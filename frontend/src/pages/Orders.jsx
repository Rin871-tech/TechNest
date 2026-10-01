import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Orders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load orders.");
        }

        setOrders(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("Please log in to view your orders.");
    }
  }, [token]);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-container">
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="orders-page">
        <div className="orders-container orders-error">
          <p className="eyebrow">MY ORDERS</p>
          <h1>Unable to load orders</h1>
          <p>{error}</p>

          <Link to="/login" className="primary-button">
            Log In →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-container">
        <div className="orders-header">
          <p className="eyebrow">TECHNEST ACCOUNT</p>
          <h1>My Orders</h1>
          <p>
            View your previous orders and track their status.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">🛍</div>

            <h2>No orders yet</h2>

            <p>
              You haven't placed an order yet.
              Start exploring our products.
            </p>

            <Link to="/products" className="primary-button">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const orderDate = new Date(
                order.createdAt
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <article
                  className="order-list-card"
                  key={order._id}
                >
                  <div className="order-list-header">
                    <div>
                      <span>ORDER ID</span>
                      <strong>
                        #{order._id}
                      </strong>
                    </div>

                    <div>
                      <span>DATE</span>
                      <strong>{orderDate}</strong>
                    </div>

                    <div>
                      <span>STATUS</span>
                      <strong className="order-list-status">
                        {order.orderStatus}
                      </strong>
                    </div>
                  </div>

                  <div className="order-list-content">
                    <div className="order-list-products">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          className="order-list-product"
                          key={item.product}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                          />

                          <div>
                            <h3>{item.name}</h3>

                            <p>
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}

                      {order.items.length > 3 && (
                        <span className="more-items">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="order-list-total">
                      <span>TOTAL</span>

                      <strong>
                        ₹{order.total.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="view-order-button"
                    >
                      View Order →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Orders;