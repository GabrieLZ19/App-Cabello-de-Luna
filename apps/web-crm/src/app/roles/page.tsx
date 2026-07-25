"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck as ShieldCheckIcon,
  Plus as PlusIcon,
  UserCheck as UserCheckIcon,
  Search as SearchIcon,
  Edit2 as Edit2Icon,
  UserX as UserXIcon,
  UserCheck2 as UserCheck2Icon,
} from "lucide-react";
import CustomAlert, { AlertType } from "../../components/CustomAlert";
import {
  getCRMStaff,
  createCRMUser,
  updateCRMUser,
} from "@/services/userService";

const ShieldCheck: any = ShieldCheckIcon;
const Plus: any = PlusIcon;
const UserCheck: any = UserCheckIcon;
const Search: any = SearchIcon;
const Edit2: any = Edit2Icon;
const UserX: any = UserXIcon;
const UserCheck2: any = UserCheck2Icon;

export default function RolesPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "ASSISTANT",
    franchiseCode: "MAIN-01",
  });

  const fetchStaffUsers = async () => {
    try {
      const data = await getCRMStaff();
      setUsersList(data);
    } catch (err) {
      console.error("Error al obtener personal administrativo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email) return;

    try {
      const res = await createCRMUser(newUser);

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewUser({
          fullName: "",
          email: "",
          password: "",
          role: "ASSISTANT",
          franchiseCode: "MAIN-01",
        });
        fetchStaffUsers();
        setAlertConfig({
          isOpen: true,
          type: "success",
          title: "Usuario Staff Registrado",
          message: `El usuario administrativo ${newUser.fullName} fue registrado con éxito.`,
          showCancel: false,
        });
      }
    } catch (err) {
      console.error("Error al registrar personal:", err);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await updateCRMUser(selectedUser.id, {
        fullName: selectedUser.fullName,
        role: selectedUser.role,
        enrollmentStatus: selectedUser.enrollmentStatus,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        fetchStaffUsers();
        setAlertConfig({
          isOpen: true,
          type: "success",
          title: "Rol Actualizado Con Éxito",
          message:
            "Los permisos y datos del usuario staff fueron actualizados exitosamente.",
          showCancel: false,
        });
      }
    } catch (err) {
      console.error("Error al actualizar rol:", err);
    }
  };

  const handleToggleDisableStaff = (user: any) => {
    const isCurrentlyActive = user.enrollmentStatus !== "SUSPENDED";
    const newStatus = isCurrentlyActive ? "SUSPENDED" : "ACTIVE";
    const actionText = isCurrentlyActive ? "deshabilitar" : "habilitar";

    setAlertConfig({
      isOpen: true,
      type: isCurrentlyActive ? "warning" : "info",
      title: `¿${actionText.toUpperCase()} USUARIO STAFF?`,
      message: `¿Estás seguro de que deseas ${actionText} el acceso para ${user.fullName}?`,
      confirmText: isCurrentlyActive ? "Deshabilitar" : "Reactivar",
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await updateCRMUser(user.id, {
            enrollmentStatus: newStatus,
          });

          if (res.ok) {
            await fetchStaffUsers();
            setTimeout(() => {
              setAlertConfig({
                isOpen: true,
                type: "success",
                title: isCurrentlyActive
                  ? "Acceso Deshabilitado"
                  : "Acceso Reactivado",
                message: `El estado del usuario ${user.fullName} se actualizó correctamente.`,
                showCancel: false,
              });
            }, 100);
          }
        } catch (err) {
          console.error("Error al cambiar estado de usuario:", err);
        }
      },
    });
  };

  const filteredStaff = usersList.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestión de Roles Administrativos
          </h1>
          <p className="text-xs text-[#B0A894] mt-1">
            Permisos para el equipo interno (Directores, Asistentes y Soporte).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario Staff</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Buscar personal por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#15100A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#C9A45C] outline-none"
        />
      </div>

      {/* Staff Container */}
      <div className="glass-panel p-4 sm:p-6">
        <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#C9A45C]" />
          <span>Personal Administrativo ({filteredStaff.length})</span>
        </h3>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/10">
            <UserCheck className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              No hay usuarios con roles administrativos registrados.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (CARDS) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredStaff.map((u) => {
                const isActive = u.enrollmentStatus !== "SUSPENDED";
                return (
                  <div
                    key={u.id}
                    className="bg-[#15100A] border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {u.fullName}
                        </h4>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                      {isActive ? (
                        <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 text-[9px] font-bold">
                          HABILITADO
                        </span>
                      ) : (
                        <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 text-[9px] font-bold">
                          DESHABILITADO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-[11px] text-gray-400 font-medium">
                        Rol:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : u.role === "ASSISTANT"
                              ? "bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleToggleDisableStaff(u)}
                        className={`w-full py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5 border ${
                          isActive
                            ? "bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 border-amber-500/30"
                            : "bg-green-500/20 hover:bg-green-500 hover:text-black text-green-300 border-green-500/30"
                        }`}
                      >
                        {isActive ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck2 className="w-3.5 h-3.5" />
                        )}
                        <span>{isActive ? "Deshabilitar" : "Habilitar"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VISTA DESKTOP (TABLA) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">Personal</th>
                    <th className="pb-3">Correo Electrónico</th>
                    <th className="pb-3">Rol Asignado</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStaff.map((u) => {
                    const isActive = u.enrollmentStatus !== "SUSPENDED";
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-white/5 transition-all"
                      >
                        <td className="py-4 font-bold text-white text-xs">
                          {u.fullName}
                        </td>
                        <td className="py-4 text-xs text-gray-300">
                          {u.email}
                        </td>
                        <td className="py-4 text-xs">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : u.role === "ASSISTANT"
                                  ? "bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 text-xs">
                          {isActive ? (
                            <span className="text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-[10px] font-bold">
                              HABILITADO
                            </span>
                          ) : (
                            <span className="text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 text-[10px] font-bold">
                              DESHABILITADO
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-xs text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setIsEditModalOpen(true);
                            }}
                            className="bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleToggleDisableStaff(u)}
                            className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1 border ${
                              isActive
                                ? "bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 border-amber-500/30"
                                : "bg-green-500/20 hover:bg-green-500 hover:text-black text-green-300 border-green-500/30"
                            }`}
                          >
                            {isActive ? (
                              <UserX className="w-3 h-3" />
                            ) : (
                              <UserCheck2 className="w-3 h-3" />
                            )}
                            <span>
                              {isActive ? "Deshabilitar" : "Habilitar"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal: Crear Usuario Staff */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15100A] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Registrar Usuario Staff
            </h3>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Contraseña de Acceso
                </label>
                <input
                  type="password"
                  required
                  placeholder="Contraseña segura"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Rol de Permisos
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                >
                  <option value="ADMIN">ADMIN (Acceso Total)</option>
                  <option value="ASSISTANT">
                    ASSISTANT (Asistente Pedagógico)
                  </option>
                  <option value="SUPPORT">SUPPORT (Soporte Técnico)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Usuario Staff */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15100A] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Editar Permisos de Usuario
            </h3>
            <form onSubmit={handleUpdateRole} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Rol Asignado
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="ASSISTANT">ASSISTANT</option>
                  <option value="SUPPORT">SUPPORT</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
