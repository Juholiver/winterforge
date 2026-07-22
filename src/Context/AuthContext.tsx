import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface AuthContextData {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const isAuthenticated = !!token;

  function login(token: string) {
    localStorage.setItem("token", token);
    setToken(token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro de um AuthProvider"
    );
  }

  return context;
}