import GrillaProductos from '../componentes/organismos/GrillaProductos';

export default function Catalogo() {
  return (
    <div className="container py-5">
      <div className="section-header mb-4">
        <h1 className="h2">Catálogo de productos</h1>
        <p className="text-muted">Stock y precios actualizados.</p>
      </div>
      <GrillaProductos />
    </div>
  );
}
