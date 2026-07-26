
import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './Pages/Login/Login'
import SignUpForm from './Pages/SingUp/SingUp'
import ListaExercicios from './Pages/Exercicios/ListaExercicios'
import { ProtectedRoute } from "./Components/ProtectedRoute/ProtectedRoute";
import Perfil from './Pages/Perfil/Perfil'
import ListaExerciciosBanco from './Pages/Exercicios/ListaExerciciosBanco'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/exercicios" element={<ListaExercicios />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/perfil"
            element={<Perfil />}
          />
          <Route path="/perfil/treinos" element={<ListaExerciciosBanco />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
