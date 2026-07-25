"use client";

import React, { useState } from "react";
import LinkRaw from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3 as barchart3icon,
  Bot as boticon,
  Users as usersicon,
  Scissors as scissorsicon,
  DollarSign as dollarsignicon,
  FileText as filetexticon,
  ShieldCheck as shieldcheckicon,
  LogOut as logouticon,
  Lock as lockicon,
  Building as buildingicon,
  Menu as menuicon,
  X as xicon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Link: any = LinkRaw;
const BarChart3: any = barchart3icon;
const Bot: any = boticon;
const Users: any = usersicon;
const Scissors: any = scissorsicon;
const DollarSign: any = dollarsignicon;
const FileText: any = filetexticon;
const ShieldCheck: any = shieldcheckicon;
const LogOut: any = logouticon;
const Lock: any = lockicon;
const Building: any = buildingicon;
const Menu: any = menuicon;
const X: any = xicon;

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === "/login") return null;

  const isAdmin = user?.role === "ADMIN";

  const menuItems = [
    { href: "/dashboard", label: "Dashboard / Resumen", icon: BarChart3 },
    {
      href: "/classes",
      label: "Gestor & PDF Clases",
      icon: Bot,
    },
    { href: "/students", label: "Alumnos Matriculados", icon: Users },
    {
      href: "/franchises",
      label: "Franquicias & Sedes",
      icon: Building,
      restrictedForAssistant: true,
    },
    { href: "/practices", label: "Cola de Prácticas", icon: Scissors },
    {
      href: "/finances",
      label: "Finanzas y Pagos",
      icon: DollarSign,
      restrictedForAssistant: true,
    },
    { href: "/audit", label: "Log de Actividad", icon: FileText },
    {
      href: "/roles",
      label: "Gestión de Roles",
      icon: ShieldCheck,
      restrictedForAssistant: true,
    },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Top Navigation Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between bg-[#15100A] border-b border-white/10 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Método Cabello de Luna"
            className="w-8 h-8 rounded-full border border-[#C9A45C] object-cover"
          />
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">
              ILTCT CRM
            </h1>
            <p className="text-[10px] text-[#C9A45C]">by Cabello de Luna</p>
          </div>
        </div>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-300 hover:text-white rounded-lg focus:outline-none"
          aria-label="Abrir Menú"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Content (Desktop Sticky & Mobile Drawer) */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 w-64 bg-[#15100A] border-r border-white/10 p-6 flex flex-col justify-between min-h-screen transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header Desktop */}
          <div className="hidden md:flex items-center space-x-3 mb-8">
            <img
              src="/logo.png"
              alt="Método Cabello de Luna"
              className="w-10 h-10 rounded-full border border-[#C9A45C] object-cover shadow-lg"
            />
            <div>
              <h1 className="font-bold text-lg text-white">ILTCT CRM</h1>
              <p className="text-xs text-[#C9A45C]">by Cabello de Luna</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2 mt-4 md:mt-0">
            {menuItems.map((item) => {
              const Icon: any = item.icon;
              const isRestricted = !isAdmin && item.restrictedForAssistant;
              const isActive = pathname === item.href;

              if (isRestricted) {
                return (
                  <div
                    key={item.href}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium opacity-40 cursor-not-allowed text-[#897F6B] bg-black/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <Lock className="w-4 h-4 text-[#f87171] flex-shrink-0" />
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    closeMenu();
                    try {
                      sessionStorage.removeItem("new_class_active_draft");
                    } catch (e) {}
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#C9A45C] text-[#0C0A07] font-bold shadow-lg"
                      : "text-[#B0A894] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile & Logout Footer */}
        <div className="bg-[#1A140E] p-4 rounded-xl border border-white/10 space-y-3 mt-6 md:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C] flex items-center justify-center font-bold text-xs text-[#C9A45C] flex-shrink-0">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-[11px] text-[#C9A45C] font-mono">
                {user?.role || "ROL"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
