import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const AdminCustomers = () => {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/customers`,
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
            "Failed to fetch customers."
        );
      }

      setCustomers(data);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCustomers();
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
              Customers
            </h1>

            <p>
              View registered TechNest customers.
            </p>
          </div>
        </div>


        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <div className="admin-empty">
            No customers registered yet.
          </div>
        ) : (
          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Account Type</th>
                </tr>
              </thead>

              <tbody>

                {customers.map((customer) => (
                  <tr key={customer._id}>

                    <td>
                      <strong>
                        {customer.name}
                      </strong>
                    </td>

                    <td>
                      {customer.email}
                    </td>

                    <td>
                      {new Date(
                        customer.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      <span className="admin-status">
                        CUSTOMER
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

export default AdminCustomers;