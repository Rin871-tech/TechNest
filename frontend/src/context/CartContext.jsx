import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart =
      localStorage.getItem("technest-cart");

    return savedCart
      ? JSON.parse(savedCart)
      : [];
  });

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "technest-cart",
      JSON.stringify(cart)
    );
  }, [cart]);


  // ==========================================
  // ADD TO CART
  // ==========================================

  const addToCart = (
    product,
    quantity = 1
  ) => {
    setCart((currentCart) => {

      const productId =
        product._id || product.id;

      const existingProduct =
        currentCart.find(
          (item) =>
            (item._id || item.id) ===
            productId
        );

      if (existingProduct) {

        return currentCart.map(
          (item) =>
            (item._id || item.id) ===
            productId
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    quantity
                }
              : item
        );
      }

      return [
        ...currentCart,

        {
          ...product,
          quantity
        }
      ];
    });
  };


  // ==========================================
  // REMOVE FROM CART
  // ==========================================

  const removeFromCart = (
    productId
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          (item._id || item.id) !==
          productId
      )
    );
  };


  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = (
    productId,
    quantity
  ) => {

    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((currentCart) =>
      currentCart.map(
        (item) =>
          (item._id || item.id) ===
          productId
            ? {
                ...item,
                quantity
              }
            : item
      )
    );
  };


  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    setCart([]);
  };


  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  const totalItems =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  // ==========================================
  // SUBTOTAL
  // ==========================================

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );


  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  return useContext(CartContext);
}