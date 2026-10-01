import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
         `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load order.");
        }

        setOrder(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrder();
    } else {
      setLoading(false);
      setError("Please log in to view this order.");
    }
  }, [id, token]);

  if (loading) {
    return (
      <main className="order-page">
        <div className="order-loading">
          <p>Loading your order...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-page">
        <div className="order-error">
          <p className="eyebrow">ORDER</p>
          <h1>Unable to load order</h1>
          <p>{error}</p>

          <Link to="/products" className="primary-button">
            ← Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const orderTime = new Date(order.createdAt).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <main className="order-page">
      <section className="order-container">

        {/* Success Header */}
        <div className="order-success">
          <div className="success-icon">✓</div>

          <p className="eyebrow">ORDER CONFIRMED</p>

          <h1>Thank you for your order!</h1>

          <p>
            Your order has been placed successfully.
            We've received your order and will start processing it soon.
          </p>
        </div>

        {/* Order Information */}
        <div className="order-card">

          <div className="order-header">
            <div>
              <span>Order ID</span>
              <strong>#{order._id}</strong>
            </div>

            <div>
              <span>Order date</span>
              <strong>{orderDate}</strong>
              <small>{orderTime}</small>
            </div>

            <div>
              <span>Order status</span>
              <strong className="order-status">
                {order.orderStatus}
              </strong>
            </div>
          </div>

          {/* Products */}
          <div className="order-section">
            <h2>Items ordered</h2>

            <div className="order-items">
              {order.items.map((item) => (
                <div
                  className="order-item"
                  key={item.product}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <div className="order-item-info">
                    <h3>{item.name}</h3>

                    <p>
                      ₹{item.price.toLocaleString("en-IN")} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <strong className="order-item-price">
                    ₹
                    {(item.price * item.quantity).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="order-info-grid">

            <div className="order-info-box">
              <h2>Delivery address</h2>

              <p>
                <strong>
                  {order.shippingAddress.fullName}
                </strong>
              </p>

              <p>{order.shippingAddress.address}</p>

              <p>
                {order.shippingAddress.city},{" "}
                {order.shippingAddress.state}
              </p>

              <p>
                PIN: {order.shippingAddress.pincode}
              </p>

              <p>
                Phone: {order.shippingAddress.phone}
              </p>
            </div>

            <div className="order-info-box">
              <h2>Payment</h2>

              <p>
                <span>Method</span>
                <strong>
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </strong>
              </p>

              <p>
                <span>Status</span>
                <strong>
                  {order.paymentStatus}
                </strong>
              </p>
            </div>

          </div>

          {/* Price Summary */}
          <div className="order-summary">
            <h2>Order summary</h2>

            <div>
              <span>Subtotal</span>

              <strong>
                ₹{order.subtotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Delivery</span>

              <strong>
                {order.deliveryCharge === 0
                  ? "FREE"
                  : `₹${order.deliveryCharge.toLocaleString(
                      "en-IN"
                    )}`}
              </strong>
            </div>

            <div className="order-total">
              <span>Total</span>

              <strong>
                ₹{order.total.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="order-actions">
          <Link
            to="/products"
            className="primary-button"
          >
            Continue Shopping →
          </Link>

          <Link
            to="/"
            className="secondary-button"
          >
            Back to Home
          </Link>
        </div>

      </section>
    </main>
  );
}

export default OrderDetails;