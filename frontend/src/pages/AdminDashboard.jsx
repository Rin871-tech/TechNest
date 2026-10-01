import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard.");
        }

        const data = await response.json();

        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAIInsights = async () => {
      try {
        const response = await fetch(
         `${import.meta.env.VITE_API_URL}/api/admin/ai-insights`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load AI insights.");
        }

        const data = await response.json();

        setAiInsights(data);
      } catch (error) {
        console.error("AI insights error:", error);
      } finally {
        setAiLoading(false);
      }
    };

    fetchDashboard();
    fetchAIInsights();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page">
        <div className="container">
          <p>
            Unable to load dashboard data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">

        {/* ==============================
            HEADER
        ============================== */}

        <div className="admin-header">
          <div>
            <p className="admin-eyebrow">
              TECHNEST ADMIN
            </p>

            <h1>Dashboard</h1>

            <p>
              Welcome back, {user.name}.
            </p>
          </div>
        </div>


        {/* ==============================
            STATISTICS
        ============================== */}

        <div className="admin-stats">

          <div className="admin-stat-card">
            <span>Revenue</span>

            <strong>
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </strong>

            <small>
              From paid orders
            </small>
          </div>


          <div className="admin-stat-card">
            <span>Orders</span>

            <strong>
              {stats.totalOrders}
            </strong>

            <small>
              Total orders
            </small>
          </div>


          <div className="admin-stat-card">
            <span>Customers</span>

            <strong>
              {stats.totalCustomers}
            </strong>

            <small>
              Registered customers
            </small>
          </div>


          <div className="admin-stat-card">
            <span>Products</span>

            <strong>
              {stats.totalProducts}
            </strong>

            <small>
              Products in catalog
            </small>
          </div>

        </div>


        {/* ==============================
            AI ORDER INTELLIGENCE
        ============================== */}

        <div className="admin-section">

          <div className="admin-section-header">
            <div>
              <p className="admin-eyebrow">
                AI AUTOMATION
              </p>

              <h2>
                Order Intelligence
              </h2>

              <p>
                AI-generated insights from recent customer orders.
              </p>
            </div>
          </div>


          {aiLoading ? (
            <div className="admin-notice">
              <div>
                <strong>
                  Loading AI insights...
                </strong>

                <span>
                  Fetching recent order intelligence
                </span>
              </div>
            </div>
          ) : aiInsights.length === 0 ? (
            <div className="admin-notice">
              <div>
                <strong>
                  No AI insights yet
                </strong>

                <span>
                  AI insights will appear here after new orders are analyzed.
                </span>
              </div>
            </div>
          ) : (
            <div className="ai-insights-list">

              {aiInsights.map((order) => (
                <div
                  className="ai-insight-card"
                  key={order._id}
                >

                  <div className="ai-insight-header">

                    <div>
                      <span className="ai-insight-label">
                        ORDER
                      </span>

                      <strong>
                        #{order._id.slice(-8)}
                      </strong>
                    </div>

                    <span
                      className={`ai-priority ai-priority-${(
                        order.aiInsight?.orderPriority || "NORMAL"
                      ).toLowerCase()}`}
                    >
                      {order.aiInsight?.orderPriority || "NORMAL"}
                    </span>

                  </div>


                  <div className="ai-insight-customer">

                    <div>
                      <span>Customer</span>

                      <strong>
                        {order.user?.name || "Unknown customer"}
                      </strong>
                    </div>

                    <div>
                      <span>Order Total</span>

                      <strong>
                        ₹{order.total?.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Customer Type</span>

                      <strong>
                        {order.aiInsight?.customerType ||
                          "General Tech Buyer"}
                      </strong>
                    </div>

                  </div>


                  <div className="ai-insight-content">

                    <div className="ai-insight-block">

                      <h4>
                        Purchase Intent
                      </h4>

                      <p>
                        {order.aiInsight?.purchaseIntent ||
                          "No purchase intent generated."}
                      </p>

                    </div>


                    <div className="ai-insight-block">

                      <h4>
                        Customer Insight
                      </h4>

                      <p>
                        {order.aiInsight?.customerInsight ||
                          "No customer insight generated."}
                      </p>

                    </div>


                    <div className="ai-insight-block">

                      <h4>
                        Admin Recommendation
                      </h4>

                      <p>
                        {order.aiInsight?.adminRecommendation ||
                          "No recommendation generated."}
                      </p>

                    </div>


                    <div className="ai-insight-block">

                      <h4>
                        Complementary Categories
                      </h4>

                      {order.aiInsight?.complementaryCategories?.length > 0 ? (
                        <div className="ai-category-list">
                          {order.aiInsight.complementaryCategories.map(
                            (category, index) => (
                              <span key={index}>
                                {category}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p>
                          No categories suggested.
                        </p>
                      )}

                    </div>

                  </div>


                  <div className="ai-insight-footer">

                    <span>
                      Generated{" "}
                      {order.aiInsight?.generatedAt
                        ? new Date(
                            order.aiInsight.generatedAt
                          ).toLocaleString("en-IN")
                        : "recently"}
                    </span>

                    <button
                      onClick={() =>
                        navigate(`/orders/${order._id}`)
                      }
                    >
                      View Order →
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>


        {/* ==============================
            QUICK ACTIONS
        ============================== */}

        <div className="admin-section">

          <div className="admin-section-header">
            <div>
              <p className="admin-eyebrow">
                MANAGEMENT
              </p>

              <h2>
                Quick actions
              </h2>
            </div>
          </div>


          <div className="admin-actions">

            <button
              className="admin-action-card"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              <span className="admin-action-icon">
                📦
              </span>

              <strong>
                Manage Products
              </strong>

              <small>
                Add, edit and remove products
              </small>
            </button>


            <button
              className="admin-action-card"
              onClick={() =>
                navigate("/admin/orders")
              }
            >
              <span className="admin-action-icon">
                🛒
              </span>

              <strong>
                Manage Orders
              </strong>

              <small>
                View and update customer orders
              </small>
            </button>


            <button
              className="admin-action-card"
              onClick={() =>
                navigate("/admin/customers")
              }
            >
              <span className="admin-action-icon">
                👥
              </span>

              <strong>
                Customers
              </strong>

              <small>
                View registered customers
              </small>
            </button>

          </div>

        </div>


        {/* ==============================
            PENDING ORDERS
        ============================== */}

        <div className="admin-notice">

          <div>
            <strong>
              {stats.pendingOrders}
            </strong>

            <span>
              orders currently require processing
            </span>
          </div>

          <button
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            View orders →
          </button>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;