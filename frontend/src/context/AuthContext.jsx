import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("technest-user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("technest-token");
  });

  const [loading, setLoading] = useState(true);


  // ======================================================
  // SAVE USER
  // ======================================================

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "technest-user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("technest-user");
    }
  }, [user]);


  // ======================================================
  // SAVE TOKEN
  // ======================================================

  useEffect(() => {
    if (token) {
      localStorage.setItem(
        "technest-token",
        token
      );
    } else {
      localStorage.removeItem("technest-token");
    }
  }, [token]);


  // ======================================================
  // REFRESH CURRENT USER FROM BACKEND
  // ======================================================

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/me`,
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
              "Authentication failed."
          );
        }

        // This gets the latest role from MongoDB
        setUser(data.user);

      } catch (error) {
        console.error(
          "Authentication refresh failed:",
          error
        );

        setUser(null);
        setToken(null);

      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);


  // ======================================================
  // REGISTER
  // ======================================================

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await fetch(
      `${API_URL}/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setUser(data.user);
    setToken(data.token);

    return data;
  };


  // ======================================================
  // LOGIN
  // ======================================================

  const login = async (
    email,
    password
  ) => {
    const response = await fetch(
      `${API_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setUser(data.user);
    setToken(data.token);

    return data;
  };


  // ======================================================
  // GOOGLE LOGIN
  // ======================================================

  const loginWithToken = async (
    googleToken
  ) => {
    const response = await fetch(
      `${API_URL}/me`,
      {
        headers: {
          Authorization:
            `Bearer ${googleToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Authentication failed."
      );
    }

    setUser(data.user);
    setToken(googleToken);

    return data;
  };


  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = () => {
    setUser(null);
    setToken(null);
  };


  // ======================================================
  // AUTH CONTEXT
  // ======================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        loginWithToken,
        logout,
        loading,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}