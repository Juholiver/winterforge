import { useAuth } from "../../Context/AuthContext";

export default function Perfil() {

  const { logout } = useAuth();

  return (
    <div>

      <h1>Perfil</h1>

      <button onClick={logout}>
        Sair
      </button>

    </div>
  );
}