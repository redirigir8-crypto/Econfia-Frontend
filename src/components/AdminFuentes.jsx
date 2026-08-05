import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const AdminFuentes = () => {
  const token = localStorage.getItem("token");

  const [fuentes, setFuentes] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [filterNombre, setFilterNombre] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    nombre: "",
    nombre_pila: "",
    tipo: "",
  });

  const [newFuente, setNewFuente] = useState({
    nombre: "",
    nombre_pila: "",
    tipo: "",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const [error, setError] = useState("");

  /* =========================
     FETCH INICIAL
  ========================= */
  useEffect(() => {
    if (!token) {
      setError("No autenticado");
      return;
    }

    const fetchData = async () => {
      try {
        const [fRes, tRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/fuentes/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          fetch(`${API_URL}/api/admin/tipos-fuente/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        if (!fRes.ok || !tRes.ok) throw new Error("Error cargando datos");

        setFuentes(await fRes.json());
        setTipos(await tRes.json());
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [token]);

  /* =========================
     FILTRO + PAGINACIÓN
  ========================= */
  const filteredFuentes = fuentes.filter(
    (f) =>
      (!filterNombre ||
        f.nombre.toLowerCase().includes(filterNombre.toLowerCase()) ||
        (f.nombre_pila && f.nombre_pila.toLowerCase().includes(filterNombre.toLowerCase()))
      ) &&
      (!filterTipo || (f.tipo.id || f.tipo) === parseInt(filterTipo))
  );

  const totalPages = Math.ceil(filteredFuentes.length / pageSize);
  const pageFuentes = filteredFuentes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* =========================
     EDITAR
  ========================= */
  const startEdit = (f) => {
    setEditId(f.id);
    setEditData({
      nombre: f.nombre,
      nombre_pila: f.nombre_pila,
      tipo: f.tipo.id || f.tipo,
    });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/admin/fuentes/${editId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editData,
            tipo: parseInt(editData.tipo),
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setFuentes(fuentes.map((f) => (f.id === editId ? updated : f)));
      setEditId(null);
      setToast({ type: "success", message: "Fuente actualizada" });
    } catch (err) {
      setError(err.message);
    }
  };

  /* =========================
     CREAR
  ========================= */
  const createFuente = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/fuentes/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newFuente,
          tipo: parseInt(newFuente.tipo),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();
      // El backend ahora retorna { detail, fuente }
      setFuentes([...fuentes, result.fuente || result]);
      setNewFuente({ nombre: "", nombre_pila: "", tipo: "" });
      setShowCreateModal(false);
      setToast({ type: "success", message: result.detail || "Fuente creada" });
    } catch (err) {
      setError(err.message);
    }
  };


  // Mensaje toast visual
  const ToastMsg = toast && (
    <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl font-semibold text-white transition-all
      ${toast.type === "success" ? "bg-green-600/90" : "bg-red-600/90"}`}
    >
      {toast.message}
    </div>
  );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <>
      {ToastMsg}
      <section className="relative min-h-screen overflow-hidden bg-transparent px-4 py-8 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
          <div className="absolute right-20 top-28 h-80 w-80 rounded-full bg-brand-2/15 blur-3xl" />
          <div className="absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-ok/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 overflow-hidden rounded-[28px] border border-line/15 bg-surface/90 p-6 shadow-[0_22px_65px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-brand">
                Centro administrativo
              </div>
              <h2 className="text-4xl font-black tracking-tight text-content sm:text-5xl">
                Administración de Fuentes
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Gestiona fuentes, nombres visibles y categorias de consulta desde una vista clara y consistente.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-5 py-4 shadow-inner">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted">Fuentes</div>
                <div className="mt-2 text-3xl font-black text-brand">{fuentes.length}</div>
              </div>
              <div className="rounded-2xl border border-ok/25 bg-ok/10 px-5 py-4 shadow-inner">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted">Tipos</div>
                <div className="mt-2 text-3xl font-black text-ok">{tipos.length}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-black text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(14,165,233,0.38)]"
            >
              Crear nueva fuente
            </button>
          </div>
        </div>

        {/* CONTENEDOR CRUD */}
        <div className="overflow-hidden rounded-[24px] border border-line/15 bg-surface/90 shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl">

          {/* FILTROS */}
          <div className="grid gap-4 border-b border-line/10 bg-surface-2/60 p-5 md:grid-cols-[1fr_340px]">
            <input
              placeholder="Filtrar por nombre..."
              value={filterNombre}
              onChange={(e) => setFilterNombre(e.target.value)}
              className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 font-semibold text-content outline-none transition placeholder:text-muted/70 focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
            />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full rounded-xl border border-line/15 bg-surface px-4 py-3 font-semibold text-content outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
            >
              <option value="">Todos</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* TABLA */}
          <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-[860px] w-full text-sm text-content">
            <thead>
              <tr className="bg-surface-2/80 text-left text-[12px] uppercase tracking-[0.18em] text-muted">
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">Nombre</th>
                <th className="px-4 py-4">Nombre Pila</th>
                <th className="px-4 py-4">Tipo</th>
                <th className="px-4 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pageFuentes.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-line/10 transition-colors hover:bg-cyan-500/[0.06]"
                >
                  <td className="px-4 py-4 font-bold text-muted">{f.id}</td>

                  <td className="px-4 py-4 font-bold">
                    {editId === f.id ? (
                      <input
                        value={editData.nombre}
                        onChange={(e) =>
                          setEditData({ ...editData, nombre: e.target.value })
                        }
                        className="w-full rounded-lg border border-line/15 bg-surface px-3 py-2 text-content outline-none focus:border-brand/50"
                      />
                    ) : (
                      f.nombre
                    )}
                  </td>

                  <td className="px-4 py-4 text-content/90">
                    {editId === f.id ? (
                      <input
                        value={editData.nombre_pila}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            nombre_pila: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-line/15 bg-surface px-3 py-2 text-content outline-none focus:border-brand/50"
                      />
                    ) : (
                      f.nombre_pila
                    )}
                  </td>

                  <td className="px-4 py-4 text-content/90">
                    {editId === f.id ? (
                      <select
                        value={editData.tipo}
                        onChange={(e) =>
                          setEditData({ ...editData, tipo: e.target.value })
                        }
                        className="w-full rounded-lg border border-line/15 bg-surface px-3 py-2 text-content outline-none focus:border-brand/50"
                      >
                        {tipos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      tipos.find(
                        (t) => t.id === (f.tipo.id || f.tipo)
                      )?.nombre
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {editId === f.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-black text-white shadow-lg shadow-emerald-500/20"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="rounded-lg border border-line/15 bg-surface px-3 py-2 text-sm font-black text-content"
                        >
                          Cancelar
                        </button>
                      </div>
                      ) : (
                      <button
                        onClick={() => startEdit(f)}
                        className="rounded-lg border border-brand/25 bg-brand/10 px-4 py-2 text-sm font-black text-brand transition-all hover:-translate-y-0.5 hover:bg-brand/15"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-line/10 px-5 py-5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-line/15 bg-surface px-4 py-2 font-bold text-content transition hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="rounded-xl border border-brand/20 bg-brand/10 px-4 py-2 font-black text-brand">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-line/15 bg-surface px-4 py-2 font-bold text-content transition hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>

        {/* MODAL CREAR */}
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)}>
            <h3 className="mb-2 text-xl font-black text-content">Crear nueva fuente</h3>
            <p className="mb-5 text-sm text-muted">Registra el nombre tecnico, nombre visible y tipo de fuente.</p>
            <div className="flex flex-col gap-3">
              <input
                placeholder="Nombre"
                value={newFuente.nombre}
                onChange={(e) =>
                  setNewFuente({ ...newFuente, nombre: e.target.value })
                }
                className="rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none placeholder:text-muted/70 focus:border-brand/50"
              />
              <input
                placeholder="Nombre pila"
                value={newFuente.nombre_pila}
                onChange={(e) =>
                  setNewFuente({
                    ...newFuente,
                    nombre_pila: e.target.value,
                  })
                }
                className="rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none placeholder:text-muted/70 focus:border-brand/50"
              />
              <select
                value={newFuente.tipo}
                onChange={(e) =>
                  setNewFuente({ ...newFuente, tipo: e.target.value })
                }
                className="rounded-xl border border-line/15 bg-surface px-4 py-3 text-content outline-none focus:border-brand/50"
              >
                <option value="">Tipo...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              <button
                onClick={createFuente}
                className="mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-black text-white shadow-lg shadow-cyan-500/20"
              >
                Crear
              </button>
            </div>
          </Modal>
        )}
      </div>
    </section>
    </>
  );
};

export default AdminFuentes;
