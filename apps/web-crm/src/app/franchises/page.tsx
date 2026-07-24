'use client';

import React, { useEffect, useState } from 'react';
import {
  Building as BuildingIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Edit2 as Edit2Icon,
  Users as UsersIcon,
  MapPin as MapPinIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Power as PowerIcon,
} from 'lucide-react';
import CustomAlert, { AlertType } from '../../components/CustomAlert';
import { getFranchises, createFranchise, updateFranchise } from '@/services/franchiseService';

const Building: any = BuildingIcon;
const Plus: any = PlusIcon;
const Search: any = SearchIcon;
const Edit2: any = Edit2Icon;
const Users: any = UsersIcon;
const MapPin: any = MapPinIcon;
const CheckCircle: any = CheckCircleIcon;
const XCircle: any = XCircleIcon;
const Power: any = PowerIcon;

export default function FranchisesPage() {
  const [franchisesList, setFranchisesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);

  // Custom Alert State
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
    type: 'info',
    title: '',
    message: '',
  });

  const [newFranchise, setNewFranchise] = useState({
    code: '',
    name: '',
    location: '',
    isActive: true,
  });

  const fetchFranchises = async () => {
    try {
      const data = await getFranchises();
      setFranchisesList(data);
    } catch (err) {
      console.error('Error al obtener franquicias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  const handleCreateFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFranchise.code || !newFranchise.name) return;

    try {
      const res = await createFranchise(newFranchise);

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewFranchise({ code: '', name: '', location: '', isActive: true });
        await fetchFranchises();
        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Franquicia Creada Con Éxito',
          message: `La franquicia ${newFranchise.name} con código ${newFranchise.code.toUpperCase()} fue registrada correctamente.`,
          showCancel: false,
        });
      }
    } catch (err) {
      console.error('Error al crear franquicia:', err);
    }
  };

  const handleUpdateFranchise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFranchise) return;

    try {
      const res = await updateFranchise(selectedFranchise.id, {
        code: selectedFranchise.code,
        name: selectedFranchise.name,
        location: selectedFranchise.location,
        isActive: selectedFranchise.isActive,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setSelectedFranchise(null);
        await fetchFranchises();
        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Franquicia Actualizada',
          message: 'Se guardaron los cambios de la sede correctamente en Supabase.',
          showCancel: false,
        });
      }
    } catch (err) {
      console.error('Error al actualizar franquicia:', err);
    }
  };

  const handleToggleDisableFranchise = (franchise: any) => {
    const isCurrentlyActive = franchise.isActive;
    const actionText = isCurrentlyActive ? 'deshabilitar' : 'reactivar';

    setAlertConfig({
      isOpen: true,
      type: isCurrentlyActive ? 'warning' : 'info',
      title: `¿${actionText.toUpperCase()} FRANQUICIA?`,
      message: `¿Estás seguro de que deseas ${actionText} la sede "${franchise.name}" (${franchise.code})?`,
      confirmText: isCurrentlyActive ? 'Deshabilitar Sede' : 'Reactivar Sede',
      showCancel: true,
      onConfirm: async () => {
        try {
          const res = await updateFranchise(franchise.id, { isActive: !isCurrentlyActive });

          if (res.ok) {
            await fetchFranchises();
            setTimeout(() => {
              setAlertConfig({
                isOpen: true,
                type: 'success',
                title: isCurrentlyActive ? 'Franquicia Deshabilitada' : 'Franquicia Reactivada',
                message: `La sede ${franchise.name} ha cambiado su estado a ${!isCurrentlyActive ? 'Habilitada' : 'Deshabilitada'} exitosamente.`,
                showCancel: false,
              });
            }, 100);
          }
        } catch (err) {
          console.error('Error al cambiar estado de franquicia:', err);
        }
      },
    });
  };

  const filteredFranchises = franchisesList.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Custom Alert */}
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Franquicias & Sedes</h1>
          <p className="text-xs text-[#B0A894] mt-1">
            Administración centralizada de sedes, códigos de franquicia y vinculación de alumnos.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Franquicia</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Buscar franquicia por nombre, código o ciudad/ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#15100A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#C9A45C] outline-none"
        />
      </div>

      {/* Franchises Table */}
      <div className="glass-panel p-6">
        <h3 className="text-xs font-bold text-[#C9A45C] uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Building className="w-4 h-4 text-[#C9A45C]" />
          <span>Sedes Oficiales Registradas</span>
        </h3>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredFranchises.length === 0 ? (
          <div className="text-center py-12 bg-black/30 rounded-xl border border-white/10">
            <Building className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No hay franquicias registradas en Supabase.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Código Sede</th>
                  <th className="pb-3">Nombre de la Franquicia</th>
                  <th className="pb-3">Ubicación / Ciudad</th>
                  <th className="pb-3">Alumnos Vinculados</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFranchises.map((f) => {
                  const isActive = f.isActive;
                  return (
                    <tr key={f.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4">
                        <span className="bg-black/50 border border-[#C9A45C]/30 px-3 py-1 rounded-lg text-[#C9A45C] font-mono font-bold text-xs">
                          {f.code}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-white text-xs">{f.name}</td>
                      <td className="py-4 text-xs text-gray-300">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{f.location || 'Sede Central'}</span>
                        </span>
                      </td>
                      <td className="py-4 text-xs">
                        <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-300 font-bold flex items-center space-x-1 w-fit text-[11px]">
                          <Users className="w-3 h-3 text-[#C9A45C]" />
                          <span>{f._count?.users || 0} alumnos</span>
                        </span>
                      </td>
                      <td className="py-4 text-xs">
                        {isActive ? (
                          <span className="text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-[10px] font-bold">
                            HABILITADA
                          </span>
                        ) : (
                          <span className="text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 text-[10px] font-bold">
                            DESHABILITADA
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedFranchise(f);
                            setIsEditModalOpen(true);
                          }}
                          className="bg-white/10 hover:bg-[#C9A45C] hover:text-black text-white px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleToggleDisableFranchise(f)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] inline-flex items-center space-x-1 border ${
                            isActive
                              ? 'bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 border-amber-500/30'
                              : 'bg-green-500/20 hover:bg-green-500 hover:text-black text-green-300 border-green-500/30'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{isActive ? 'Deshabilitar' : 'Habilitar'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Nueva Franquicia */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15100A] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C] flex items-center justify-center text-[#C9A45C]">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Registrar Nueva Franquicia</h3>
                <p className="text-xs text-gray-400">Creá un código oficial de sede para asociar alumnos.</p>
              </div>
            </div>

            <form onSubmit={handleCreateFranchise} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Código de Franquicia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ILTCT-MEX-01"
                  value={newFranchise.code}
                  onChange={(e) => setNewFranchise({ ...newFranchise, code: e.target.value })}
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Nombre de la Sede</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Franquicia Sede Polanco México"
                  value={newFranchise.name}
                  onChange={(e) => setNewFranchise({ ...newFranchise, name: e.target.value })}
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Ubicación / Ciudad</label>
                <input
                  type="text"
                  placeholder="Ej: Ciudad de México"
                  value={newFranchise.location}
                  onChange={(e) => setNewFranchise({ ...newFranchise, location: e.target.value })}
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg"
                >
                  Guardar Franquicia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Franquicia */}
      {isEditModalOpen && selectedFranchise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#15100A] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Editar Franquicia</h3>
            <form onSubmit={handleUpdateFranchise} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Código de Franquicia</label>
                <input
                  type="text"
                  value={selectedFranchise.code}
                  onChange={(e) => setSelectedFranchise({ ...selectedFranchise, code: e.target.value })}
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Nombre de la Sede</label>
                <input
                  type="text"
                  value={selectedFranchise.name}
                  onChange={(e) => setSelectedFranchise({ ...selectedFranchise, name: e.target.value })}
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-medium">Ubicación / Ciudad</label>
                <input
                  type="text"
                  value={selectedFranchise.location || ''}
                  onChange={(e) => setSelectedFranchise({ ...selectedFranchise, location: e.target.value })}
                  className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#C9A45C] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
