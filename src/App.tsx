
import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './Pages/Login/Login'
import SignUpForm from './Pages/SingUp/SingUp'
import ListaExercicios from './Pages/Exercicios/ListaExercicios'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/exercicios" element={<ListaExercicios />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
