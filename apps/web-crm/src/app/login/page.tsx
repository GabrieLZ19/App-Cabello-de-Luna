'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock as LockIcon, UserCheck as UserCheckIcon, Shield as ShieldIcon } from 'lucide-react';

const Lock: any = LockIcon;
const UserCheck: any = UserCheckIcon;
const Shield: any = ShieldIcon;

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('mariana@instituto.com');
  const [password, setPassword] = useState('Admin123!');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'ASSISTANT'>('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    setLoading(false);
    
    if (!res.success) {
      setError(res.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A07] flex items-center justify-center p-6">
      <div className="bg-[#15100A] border border-[#C9A45C]/30 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Método Cabello de Luna"
            className="w-16 h-16 rounded-full border-2 border-[#C9A45C] object-cover mx-auto shadow-xl"
          />
          <h1 className="text-2xl font-bold text-white">Centro de Control CRM</h1>
          <p className="text-xs text-[#C9A45C] uppercase tracking-widest font-semibold">
            Instituto Latinoamericano de Tricología
          </p>
        </div>

        {/* User Role Selection Demo */}
        <div className="bg-[#1A140E] p-3 rounded-2xl border border-white/10 space-y-2">
          <p className="text-xs font-bold text-[#B0A894] uppercase tracking-wider text-center">
            Seleccionar Usuario de Prueba:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setEmail('mariana@instituto.com');
                setPassword('Admin123!');
              }}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#C9A45C] text-black border-[#C9A45C]'
                  : 'bg-black/40 border-white/10 text-gray-400'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Mariana (ADMIN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('ASSISTANT');
                setEmail('dani@instituto.com');
                setPassword('Assistant123!');
              }}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'ASSISTANT'
                  ? 'bg-[#C9A45C] text-black border-[#C9A45C]'
                  : 'bg-black/40 border-white/10 text-gray-400'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Dani (ASISTENTE)</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#B0A894] uppercase mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#C9A45C] outline-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#B0A894] uppercase mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0C0A07] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#C9A45C] outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A45C] hover:bg-[#b5924d] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Ingresando...' : 'Ingresar al Panel CRM'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
