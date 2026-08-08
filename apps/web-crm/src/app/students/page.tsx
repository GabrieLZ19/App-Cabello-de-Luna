"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users as UsersIcon,
  UserPlus as UserPlusIcon,
  Search as SearchIcon,
  Building as BuildingIcon,
  Edit2 as Edit2Icon,
  UserX as UserXIcon,
  UserCheck2 as UserCheck2Icon,
  Eye as EyeIcon,
} from "lucide-react";
import CustomAlert, { AlertType } from "../../components/CustomAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  getCRMStudents,
  createCRMUser,
  updateCRMUser,
} from "@/services/userService";

const Users: any = UsersIcon;
const UserPlus: any = UserPlusIcon;
const Search: any = SearchIcon;
const Building: any = BuildingIcon;
const Edit2: any = Edit2Icon;
const UserX: any = UserXIcon;
const UserCheck2: any = UserCheck2Icon;
const Eye: any = EyeIcon;

export default function StudentsPage() {
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

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

  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    password: "",
    franchiseCode: "ILTCT-ARG-01",
    franchiseName: "Franquicia Central Buenos Aires",
    enrollmentStatus: "ACTIVE",
    currentPhase: "THEORY",
  });

  const fetchStudents = async () => {
    try {
      const data = await getCRMStudents();
      setStudentsList(data);
    } catch (err) {
      console.error("Error al obtener lista de alumnos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName || !newStudent.email) return;

    try {
      const res = await createCRMUser({
        ...newStudent,
        role: "STUDENT",
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewStudent({
          fullName: "",
          email: "",
          password: "",
          franchiseCode: "ILTCT-ARG-01",
          franchiseName: "Franquicia Central Buenos Aires",
          enrollmentStatus: "ACTIVE",
          currentPhase: "THEORY",
        });
        fetchStudents();
        setAlertConfig({
          isOpen: true,
          type: "success",
          title: "Alumno Matriculado",
          message: `El estudiante ${newStudent.fullName} ha sido registrado exitosamente.`,
          showCancel: false,
        });
      }
    } catch (err) {
      console.error("Error al crear alumno:", err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const res = await updateCRMUser(selectedStudent.id, {
        fullName: selectedStudent.fullName,
        enrollmentStatus: selectedStudent.enrollmentStatus,
        currentPhase: selectedStudent.currentPhase,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedStudent(null);
        fetchStudents();
        setAlertConfig({
          isOpen: true,
          type: "success",
          title: "Matrícula Actualizada",
          message: "Se actualizaron los datos del alumno correctamente.",
          showCancel: false,
        });
      }
    } catch (err) {
      console.error("Error al actualizar alumno:", err);
    }
  };

  const handleToggleDisableStudent = (student: any) => {
    const isCurrentlyActive = student.enrollmentStatus !== "SUSPENDED";
    const newStatus = isCurrentlyActive ? "SUSPENDED" : "ACTIVE";
    const actionText = isCurrentlyActive ? "deshabilitar" : "habilitar";

    setAlertConfig({
      isOpen: true,
      type: isCurrentlyActive ? "warning" : "info",
      title: `¿${actionText.toUpperCase()} MATRÍCULA DE ESTUDIANTE?`,
      message: `¿Estás seguro de que deseas ${actionText} la matrícula de ${student.fullName}?`,
      confirmText: isCurrentlyActive ? "Deshabilitar" : "Reactivar",
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await updateCRMUser(student.id, {
            enrollmentStatus: newStatus,
          });

          if (res.ok) {
            await fetchStudents();
            setTimeout(() => {
              setAlertConfig({
                isOpen: true,
                type: "success",
                title: isCurrentlyActive
                  ? "Matrícula Deshabilitada"
                  : "Matrícula Reactivada",
                message: `El estado de matrícula de ${student.fullName} se actualizó con éxito.`,
                showCancel: false,
              });
            }, 100);
          }
        } catch (err) {
          console.error("Error al cambiar estado de estudiante:", err);
        }
      },
    });
  };

  const filteredStudents = studentsList.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.franchise?.code || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
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
            Matrícula de Estudiantes
          </h1>
          <p className="text-xs text-[#B0A894] mt-1">
            Gestión completa de accesos a la app móvil y asignación de sedes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <UserPlus className="w-4 h-4" />
          <span>Matricular Nuevo Alumno</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Buscar estudiante por nombre, email o franquicia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#15100A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#C9A45C] outline-none"
        />
      </div>

      {/* Main Content Area */}
      <div className="glass-panel p-4 sm:p-6">
        <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Users className="w-4 h-4 text-[#C9A45C]" />
          <span>Alumnos Matriculados ({filteredStudents.length})</span>
        </h3>

        {loading ? (
          <PageSkeleton rows={4} showCards={false} />
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/10">
            <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">
              No hay alumnos matriculados.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA MÓVIL (CARDS) - Visibles solo en < md */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredStudents.map((s) => {
                const isActive = s.enrollmentStatus !== "SUSPENDED";
                return (
                  <div
                    key={s.id}
                    className="bg-[#15100A] border border-white/10 rounded-2xl p-4 space-y-3 relative shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {s.fullName}
                        </h4>
                        <p className="text-xs text-gray-400">{s.email}</p>
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
                      <span className="bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg text-white font-mono text-[10px] flex items-center space-x-1">
                        <Building className="w-3 h-3 text-[#C9A45C]" />
                        <span>{s.franchise?.code || "SIN FRANQUICIA"}</span>
                      </span>

                      <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {s.currentPhase || "THEORY"}
                      </span>
                    </div>

                    {/* Botones de acción directos en móvil */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <Link
                        href={`/students/${s.id}`}
                        className="col-span-2 w-full bg-[#C9A45C]/10 hover:bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/30 py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Progreso</span>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center space-x-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleToggleDisableStudent(s)}
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

            {/* VISTA DESKTOP (TABLA) - Visible solo en >= md */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Estudiante</th>
                    <th className="pb-3 px-4">Email</th>
                    <th className="pb-3 px-4">Franquicia</th>
                    <th className="pb-3 px-4">Fase</th>
                    <th className="pb-3 px-4">Estado</th>
                    <th className="pb-3 pl-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((s) => {
                    const isActive = s.enrollmentStatus !== "SUSPENDED";
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-white/5 transition-all"
                      >
                        <td className="py-4 pr-4 font-bold text-white text-xs">
                          {s.fullName}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-300">
                          {s.email}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg text-white font-mono text-[11px] inline-flex items-center space-x-1">
                            <Building className="w-3 h-3 text-[#C9A45C]" />
                            <span>{s.franchise?.code || "SIN FRANQUICIA"}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            {s.currentPhase || "THEORY"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs">
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
                        <td className="py-4 pl-4 text-xs text-right space-x-2">
                          <Link
                            href={`/students/${s.id}`}
                            className="bg-[#C9A45C]/10 hover:bg-[#C9A45C]/20 text-[#C9A45C] border border-[#C9A45C]/30 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Progreso</span>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                              setIsEditModalOpen(true);
                            }}
                            className="bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleToggleDisableStudent(s)}
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

      {/* Modal: Matricular Alumno */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15100A] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C] flex items-center justify-center text-[#C9A45C] flex-shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Matricular Nuevo Estudiante
                </h3>
                <p className="text-[11px] text-gray-400">
                  Asigná credenciales de ingreso e institución.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura Pérez"
                    value={newStudent.fullName}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, fullName: e.target.value })
                    }
                    className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alumno@ejemplo.com"
                    value={newStudent.email}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, email: e.target.value })
                    }
                    className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">
                    Contraseña Inicial
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Contraseña"
                    value={newStudent.password}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, password: e.target.value })
                    }
                    className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">
                    Código Franquicia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ILTCT-MEX-01"
                    value={newStudent.franchiseCode}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        franchiseCode: e.target.value,
                      })
                    }
                    className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white focus:border-[#C9A45C] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">
                  Nombre de Sede
                </label>
                <input
                  type="text"
                  placeholder="Ej: Franquicia Sede Polanco"
                  value={newStudent.franchiseName}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      franchiseName: e.target.value,
                    })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">
                    Estado Inicial
                  </label>
                  <select
                    value={newStudent.enrollmentStatus}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        enrollmentStatus: e.target.value,
                      })
                    }
                    className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Habilitado)</option>
                    <option value="PENDING_PAYMENT">
                      PENDING_PAYMENT (Pendiente)
                    </option>
                    <option value="SUSPENDED">SUSPENDED (Deshabilitado)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-medium">
                    Fase del Programa
                  </label>
                  <select
                    value={newStudent.currentPhase}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        currentPhase: e.target.value,
                      })
                    }
                    className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                  >
                    <option value="THEORY">THEORY (Módulo Teórico)</option>
                    <option value="PRACTICE">PRACTICE (Módulo Práctico)</option>
                  </select>
                </div>
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
                  className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2 rounded-xl text-xs shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Alumno */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15100A] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Editar Matrícula de Alumno
            </h3>
            <form onSubmit={handleUpdateStudent} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={selectedStudent.fullName}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Estado de Matrícula
                </label>
                <select
                  value={selectedStudent.enrollmentStatus}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      enrollmentStatus: e.target.value,
                    })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-[#C9A45C] font-bold focus:border-[#C9A45C] outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Habilitado)</option>
                  <option value="PENDING_PAYMENT">
                    PENDING_PAYMENT (Pendiente)
                  </option>
                  <option value="SUSPENDED">SUSPENDED (Deshabilitado)</option>
                  <option value="GRADUATED">GRADUATED (Graduado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Fase del Programa
                </label>
                <select
                  value={selectedStudent.currentPhase}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      currentPhase: e.target.value,
                    })
                  }
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#C9A45C] outline-none"
                >
                  <option value="THEORY">THEORY (Módulo Teórico)</option>
                  <option value="PRACTICE">PRACTICE (Módulo Práctico)</option>
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
