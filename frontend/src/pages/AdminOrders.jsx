import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const AdminOrders = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch orders."
        );
      }

      setOrders(data);

    } catch (error) {
      console.error(
        "Admin orders error:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="page">
      <div className="container">

        <div className="admin-page-header">
          <div>
            <p className="admin-eyebrow">
              TECHNEST ADMIN
            </p>

            <h1>
              Manage Orders
            </h1>

            <p>
              View customer orders and payment
              information.
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            No orders found.
          </div>
        ) : (
          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {orders.map((order) => (
                  <tr key={order._id}>

                    <td>
                      <strong>
                        #
                        {order._id
                          .slice(-8)
                          .toUpperCase()}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {order.user?.name ||
                          "Unknown"}
                      </strong>

                      <small className="admin-muted">
                        {order.user?.email || ""}
                      </small>
                    </td>

                    <td>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      ₹
                      {Number(
                        order.total
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      <span className="admin-status">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span className="admin-status">
                        {order.orderStatus}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;