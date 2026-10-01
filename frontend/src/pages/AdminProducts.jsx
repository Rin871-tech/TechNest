import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const emptyForm = {
  name: "",
  price: "",
  category: "",
  brand: "",
  image: "",
  description: "",
  stock: "10"
};

const AdminProducts = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch products."
        );
      }

      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const url = editingId
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save product."
        );
      }

      resetForm();
      await fetchProducts();

    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand,
      image: product.image,
      description: product.description,
      stock: product.stock
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete product."
        );
      }

      await fetchProducts();

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="page">
      <div className="container">

        <div className="admin-page-header">
          <div>
            <p className="admin-eyebrow">
              TECHNEST ADMIN
            </p>

            <h1>
              {editingId
                ? "Edit Product"
                : "Manage Products"}
            </h1>

            <p>
              Add, edit and manage your product
              catalog.
            </p>
          </div>
        </div>


        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {/* PRODUCT FORM */}

        <div className="admin-form-card">

          <h2>
            {editingId
              ? "Edit product"
              : "Add new product"}
          </h2>

          <form
            className="admin-product-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-form-grid">

              <div className="admin-form-field">
                <label>
                  Product name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="MacBook Air"
                  required
                />
              </div>


              <div className="admin-form-field">
                <label>
                  Price
                </label>

                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="99999"
                  required
                />
              </div>


              <div className="admin-form-field">
                <label>
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Laptops"
                  required
                />
              </div>


              <div className="admin-form-field">
                <label>
                  Brand
                </label>

                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Apple"
                  required
                />
              </div>


              <div className="admin-form-field">
                <label>
                  Stock
                </label>

                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="admin-form-field">
                <label>
                  Image URL
                </label>

                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>

            </div>


            <div className="admin-form-field">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                rows="4"
                required
              />
            </div>


            <div className="admin-form-actions">

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Add Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>


        {/* PRODUCT LIST */}

        <div className="admin-list-section">

          <div className="admin-list-header">
            <h2>
              Products
            </h2>

            <span>
              {products.length} products
            </span>
          </div>


          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <div className="admin-empty">
              No products found.
            </div>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {products.map((product) => (
                    <tr key={product._id}>

                      <td>
                        <div className="admin-product-cell">

                          <img
                            src={product.image}
                            alt={product.name}
                          />

                          <strong>
                            {product.name}
                          </strong>

                        </div>
                      </td>

                      <td>
                        {product.category}
                      </td>

                      <td>
                        {product.brand}
                      </td>

                      <td>
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            product.stock === 0
                              ? "stock-danger"
                              : product.stock <= 3
                                ? "stock-warning"
                                : "stock-good"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td>

                        <div className="admin-table-actions">

                          <button
                            onClick={() =>
                              handleEdit(product)
                            }
                            className="admin-edit-button"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                product._id
                              )
                            }
                            className="admin-delete-button"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminProducts;