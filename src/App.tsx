import { Routes, Route } from 'react-router-dom';
import Navbar from './componentes/organismos/Navbar';
import Footer from './componentes/organismos/Footer';
import RutaProtegida from './componentes/organismos/RutaProtegida';

import Inicio from './paginas/Inicio';
import Nosotros from './paginas/Nosotros';
import Contenidos from './paginas/Contenidos';
import ContenidoDetalle from './paginas/ContenidoDetalle';
import Contacto from './paginas/Contacto';
import Login from './paginas/Login';
import Registro from './paginas/Registro';
import Catalogo from './paginas/Catalogo';
import ProductoDetalle from './paginas/ProductoDetalle';
import Carrito from './paginas/Carrito';
import Checkout from './paginas/Checkout';

import AdminDashboard from './paginas/admin/AdminDashboard';
import AdminProductos from './paginas/admin/AdminProductos';
import AdminProductoEditar from './paginas/admin/AdminProductoEditar';
import AdminUsuarios from './paginas/admin/AdminUsuarios';
import AdminUsuarioForm from './paginas/admin/AdminUsuarioForm';

// Define la navegación pública y limita las rutas administrativas al usuario autorizado.
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contenidos" element={<Contenidos />} />
          <Route path="/contenidos/:id" element={<ContenidoDetalle />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/catalogo/:codigo" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/admin"
            element={
              <RutaProtegida>
                <AdminDashboard />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/productos"
            element={
              <RutaProtegida>
                <AdminProductos />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/productos/:codigo"
            element={
              <RutaProtegida>
                <AdminProductoEditar />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <RutaProtegida>
                <AdminUsuarios />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/usuarios/:run"
            element={
              <RutaProtegida>
                <AdminUsuarioForm />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<Inicio />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
