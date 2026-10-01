import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

function Checkout() {
  const navigate = useNavigate();

  const { cart, subtotal, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [paymentScreen, setPaymentScreen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  if (!isAuthenticated) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <p className="eyebrow">CHECKOUT</p>

          <h1>Please log in first.</h1>

          <p>
            You need an account to place an order.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            Log in →
          </button>
        </div>
      </main>
    );
  }

  if (cart.length === 0 && !success && !paymentScreen) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <p className="eyebrow">CHECKOUT</p>

          <h1>Your cart is empty.</h1>

          <button
            className="primary-button"
            onClick={() => navigate("/products")}
          >
            Continue shopping →
          </button>
        </div>
      </main>
    );
  }

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  // ==========================================
  // CREATE ORDER
  // ==========================================

  const createOrder = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity
        })),
        shippingAddress: form,
        paymentMethod
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create order."
      );
    }

    return data.order;
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const order = await createOrder();

      // COD → directly complete order
      if (paymentMethod === "COD") {
        clearCart();
        setSuccess(true);

        setTimeout(() => {
          navigate(`/orders/${order._id}`);
        }, 1200);

        return;
      }

      // ONLINE → open payment simulation
      setCurrentOrder(order);
      setPaymentScreen(true);

    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SIMULATE PAYMENT
  // ==========================================

  const handlePayment = async (result) => {
    if (!currentOrder) return;

    setPaymentProcessing(true);
    setError("");
    setPaymentFailed(false);

    try {
      // Small delay to imitate payment gateway processing
      await new Promise((resolve) =>
        setTimeout(resolve, 1800)
      );

      const response = await fetch(
        `${API_URL}/${currentOrder._id}/simulate-payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentResult: result
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Payment failed."
        );
      }

      // ------------------------------------------
      // SUCCESS
      // ------------------------------------------

      if (result === "SUCCESS") {
        clearCart();

        setPaymentScreen(false);
        setSuccess(true);

        setTimeout(() => {
          navigate(`/orders/${currentOrder._id}`);
        }, 1200);

        return;
      }

      // ------------------------------------------
      // FAILED
      // ------------------------------------------

      if (result === "FAILED") {
        setPaymentFailed(true);
        return;
      }

      // ------------------------------------------
      // CANCELLED
      // ------------------------------------------

      setPaymentScreen(false);
      setCurrentOrder(null);

    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // ==========================================
  // PAYMENT SCREEN
  // ==========================================

  if (paymentScreen && currentOrder) {
    return (
      <main className="checkout-page">

        <div className="checkout-empty">

          <p className="eyebrow">
            TECHNEST PAYMENT
          </p>

          <h1>
            Complete your payment
          </h1>

          <p>
            This is a simulated payment gateway
            for the TechNest project.
          </p>

          <div
            style={{
              maxWidth: "430px",
              margin: "30px auto",
              padding: "30px",
              background: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              textAlign: "left"
            }}
          >

            <p
              style={{
                margin: "0 0 8px",
                color: "#777",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              }}
            >
              Amount payable
            </p>

            <h2
              style={{
                margin: "0 0 25px",
                fontSize: "32px"
              }}
            >
              ₹{currentOrder.total.toLocaleString("en-IN")}
            </h2>

            <div
              style={{
                padding: "15px",
                marginBottom: "20px",
                borderRadius: "7px",
                background: "#f5f5f2",
                fontSize: "13px",
                lineHeight: "1.6"
              }}
            >
              <strong>
                Demo Payment Gateway
              </strong>

              <p style={{ margin: "5px 0 0", color: "#666" }}>
                No real money will be charged.
                Choose an outcome below to test
                the payment flow.
              </p>
            </div>

            {paymentFailed && (
              <div
                style={{
                  padding: "12px 14px",
                  marginBottom: "15px",
                  borderRadius: "6px",
                  background: "#fff0ed",
                  border: "1px solid #ffc9bd",
                  color: "#b52d15",
                  fontSize: "13px"
                }}
              >
                Payment failed. Please try again
                or cancel the payment.
              </div>
            )}

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >

              <button
                type="button"
                className="checkout-submit"
                disabled={paymentProcessing}
                onClick={() =>
                  handlePayment("SUCCESS")
                }
              >
                {paymentProcessing
                  ? "Processing..."
                  : "✓ Simulate Successful Payment"}
              </button>

              <button
                type="button"
                disabled={paymentProcessing}
                onClick={() =>
                  handlePayment("FAILED")
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "#111111",
                  fontWeight: "600",
                  cursor: paymentProcessing
                    ? "not-allowed"
                    : "pointer",
                  opacity: paymentProcessing
                    ? 0.6
                    : 1
                }}
              >
                ✕ Simulate Failed Payment
              </button>

              <button
                type="button"
                disabled={paymentProcessing}
                onClick={() =>
                  handlePayment("CANCELLED")
                }
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "none",
                  background: "transparent",
                  color: "#777777",
                  fontWeight: "600",
                  cursor: paymentProcessing
                    ? "not-allowed"
                    : "pointer"
                }}
              >
                ← Cancel Payment
              </button>

            </div>

          </div>

          <p
            style={{
              color: "#999",
              fontSize: "11px"
            }}
          >
            Simulation only • No financial transaction
          </p>

        </div>

      </main>
    );
  }

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (success) {
    return (
      <main className="checkout-page">

        <div className="checkout-success">

          <div className="success-icon">
            ✓
          </div>

          <p className="eyebrow">
            {paymentMethod === "ONLINE"
              ? "PAYMENT SUCCESSFUL"
              : "ORDER CONFIRMED"}
          </p>

          <h1>
            {paymentMethod === "ONLINE"
              ? "Payment successful!"
              : "Thank you for your order!"}
          </h1>

          <p>
            {paymentMethod === "ONLINE"
              ? "Your simulated online payment was completed successfully."
              : "Your order has been placed successfully."}
          </p>

          <p className="checkout-redirect">
            Redirecting to your order...
          </p>

        </div>

      </main>
    );
  }

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  return (
    <main className="checkout-page">

      <div className="checkout-header">

        <p className="eyebrow">
          TECHNEST CHECKOUT
        </p>

        <h1>
          Complete your order
        </h1>

        <p>
          Enter your delivery details and choose
          your payment method.
        </p>

      </div>

      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      <section className="checkout-layout">

        {/* ================================
            DELIVERY
        ================================= */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >

          <div className="checkout-section">

            <div className="checkout-section-heading">

              <span>01</span>

              <div>
                <h2>
                  Delivery details
                </h2>

                <p>
                  Where should we deliver your order?
                </p>
              </div>

            </div>

            <div className="checkout-fields">

              <label>
                <span>Full name</span>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </label>

              <label>
                <span>Address</span>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="House number, street, area"
                />
              </label>

              <div className="checkout-row">

                <label>
                  <span>City</span>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                  />
                </label>

                <label>
                  <span>State</span>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    placeholder="State"
                  />
                </label>

              </div>

              <div className="checkout-row">

                <label>
                  <span>Pincode</span>

                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="6-digit pincode"
                  />
                </label>

                <label>
                  <span>Phone</span>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="Mobile number"
                  />
                </label>

              </div>

            </div>

          </div>

          {/* ================================
              PAYMENT METHOD
          ================================= */}

          <div className="checkout-section">

            <div className="checkout-section-heading">

              <span>02</span>

              <div>
                <h2>
                  Payment method
                </h2>

                <p>
                  Choose how you want to pay.
                </p>
              </div>

            </div>

            <div className="payment-options">

              <label
                className={`payment-option ${
                  paymentMethod === "COD"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={
                    paymentMethod === "COD"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <div className="payment-option-content">

                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay when your order arrives.
                  </span>

                </div>

                {paymentMethod === "COD" && (
                  <span className="payment-check">
                    ✓
                  </span>
                )}

              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "ONLINE"
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={
                    paymentMethod === "ONLINE"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value
                    )
                  }
                />

                <div className="payment-option-content">

                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    Simulated secure payment.
                  </span>

                </div>

                {paymentMethod === "ONLINE" && (
                  <span className="payment-check">
                    ✓
                  </span>
                )}

              </label>

            </div>

          </div>

          {/* ================================
              SUBMIT
          ================================= */}

          <button
            type="submit"
            className="checkout-submit"
            disabled={loading}
          >
            {loading
              ? "Creating order..."
              : paymentMethod === "ONLINE"
                ? `Continue to Payment →`
                : "Place Order →"}
          </button>

          <p className="checkout-security">
            🔒 Your information is securely processed.
          </p>

        </form>

        {/* ================================
            SUMMARY
        ================================= */}

        <aside className="checkout-summary">

          <div className="checkout-summary-header">

            <p className="eyebrow">
              ORDER SUMMARY
            </p>

            <h2>
              {cart.length}{" "}
              {cart.length === 1
                ? "item"
                : "items"}
            </h2>

          </div>

          <div className="checkout-products">

            {cart.map((item) => (
              <div
                className="checkout-product"
                key={item._id}
              >

                <div className="checkout-product-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <span>
                    {item.quantity}
                  </span>

                </div>

                <div className="checkout-product-info">

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    ₹
                    {item.price.toLocaleString(
                      "en-IN"
                    )}{" "}
                    × {item.quantity}
                  </p>

                </div>

                <strong>
                  ₹
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString("en-IN")}
                </strong>

              </div>
            ))}

          </div>

          <div className="checkout-summary-lines">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div>
              <span>
                Delivery
              </span>

              <strong className="free">
                FREE
              </strong>
            </div>

          </div>

          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </strong>

          </div>

          <div className="checkout-note">

            <strong>
              {paymentMethod === "ONLINE"
                ? "Demo payment mode"
                : "Cash on Delivery"}
            </strong>

            <p>
              {paymentMethod === "ONLINE"
                ? "This payment is simulated for the TechNest project. No real money will be charged."
                : "Pay the delivery partner when your order arrives."}
            </p>

          </div>

        </aside>

      </section>

    </main>
  );
}

export default Checkout;