import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import LogoBienestar from '../images/logo-bienestar_blank.png';
import Swal from 'sweetalert2';
import SidebarLinkGroup from './SidebarLinkGroup';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true');

  // Cerrar al hacer click fuera
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Cerrar con ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector('body').classList.add('sidebar-expanded');
    } else {
      document.querySelector('body').classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  async function onLogout() {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas cerrar tu sesión?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      dispatch(logout());
      navigate('/login', { replace: true });
      Swal.fire({
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  return (
    <div>
      {/* Fondo para móvil */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar shrink-0 bg-colorPrimario p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        } ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Botón cerrar */}
          <button
            ref={trigger}
            className="lg:hidden text-slate-200 hover:text-slate-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Cerrar sidebar</span>
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <img className="w-40 h-40 sm:w-auto sm:h-full" src={LogoBienestar} alt="BIENESTAR"/>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-slate-200 font-semibold pl-3">
              <span className={`${sidebarExpanded ? 'hidden' : 'block'} text-center w-6`} aria-hidden="true">•••</span>
              <span className={`${sidebarExpanded ? 'block' : 'hidden'}`}>MENÚ</span>
            </h3>
            <ul className="mt-3">
              {/* Dashboard */}
              <SidebarLinkGroup activecondition={pathname === '/' || pathname.includes('dashboard')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block truncate transition duration-150 ${
                          pathname === '/' || pathname.includes('dashboard') ? 'text-slate-100 hover:text-white' : 'text-slate-300 hover:text-slate-100'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className={`shrink-0 h-6 w-6 ${pathname.includes('dashboard') ? 'rotate' : ''}`} viewBox="0 0 24 24">
                              <circle className={`fill-current ${pathname.includes('dashboard') ? 'text-red-300' : 'text-slate-400'}`} cx="12" cy="12" r="10" />
                              <circle className={`fill-current ${pathname.includes('dashboard') ? 'text-red-500' : 'text-slate-600'}`} cx="12" cy="12" r="8" />
                              <line className={`stroke-current ${pathname.includes('dashboard') ? 'text-red-200' : 'text-slate-400'}`} x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />
                              <line className={`stroke-current ${pathname.includes('dashboard') ? 'text-red-200' : 'text-slate-400'}`} x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
                            </svg>
                            <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                              Dashboard
                            </span>
                          </div>
                          <div className="flex shrink-0 ml-2">
                            <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-100 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="/dashboard"
                              className={({ isActive }) =>
                                'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                              }
                            >
                              <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Principal
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              {/* Catálogos */}
              {user?.profile === '1' && (
                <SidebarLinkGroup activecondition={pathname === '/' || pathname.includes('catalogo')}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <a
                          href="#0"
                          className={`block truncate transition duration-150 ${
                            pathname === '/' || pathname.includes('catalogo') ? 'text-slate-100 hover:text-white' : 'text-slate-300 hover:text-slate-100'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <svg className={`shrink-0 h-6 w-6 ${pathname === '/' || pathname.includes('catalogo') ? 'fade-zoom' : ''}`} viewBox="0 0 24 24">
                                <path
                                  className={`fill-current ${pathname === '/' || pathname.includes('catalogo') ? 'text-cyan-500' : 'text-slate-600'}`}
                                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                />
                              </svg>
                              <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Administración
                              </span>
                            </div>
                            <div className="flex shrink-0 ml-2">
                              <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-100 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                                <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                              </svg>
                            </div>
                          </div>
                        </a>
                        <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                          <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-usuarios"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Usuarios
                                </span>
                              </NavLink>
                            </li>
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                to="/catalogo-direcciones"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Direcciones
                                </span>
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
              )}

              {/* Gestión de Inventarios */}
              <SidebarLinkGroup activecondition={pathname.includes('inventarios')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block truncate transition duration-150 ${
                          pathname.includes('inventarios') ? 'text-slate-100 hover:text-white' : 'text-slate-300 hover:text-slate-100'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                              <path
                                className={`fill-current ${pathname.includes('inventarios') ? 'text-cyan-500' : 'text-slate-600'}`}
                                d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"
                              />
                            </svg>
                            <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                              Gestión de Inventarios
                            </span>
                          </div>
                          <div className="flex shrink-0 ml-2">
                            <svg className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-100 ${open && 'rotate-180'}`} viewBox="0 0 12 12">
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to="/inventarios/rentado"
                              className={({ isActive }) =>
                                'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                              }
                            >
                              <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Inventario Rentado
                              </span>
                            </NavLink>
                          </li>
                          
                          {user?.profile !== '3' && (
                            <li className="mb-1 last:mb-0">
                              <NavLink
                                end
                                to="/inventarios/gem"
                                className={({ isActive }) =>
                                  'block transition duration-150 truncate ' + (isActive ? 'text-white' : 'text-slate-200 hover:text-white')
                                }
                              >
                                <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                  Inventario GEM
                                </span>
                              </NavLink>
                            </li>
                          )}
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>

          {/* Más */}
          <div>
            <h3 className="text-xs uppercase text-slate-500 font-semibold pl-3">
              <span className={`${sidebarExpanded ? 'hidden' : 'block'} text-center w-6`} aria-hidden="true">•••</span>
              <span className={`${sidebarExpanded ? 'block' : 'hidden'}`}>Más</span>
            </h3>
            <ul className="mt-3">
              {/* Autenticación */}
              <SidebarLinkGroup>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <a
                        href="#0"
                        className={`block text-slate-200 truncate transition duration-150 ${open ? 'hover:text-slate-200' : 'hover:text-white'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="shrink-0 h-6 w-6" viewBox="0 0 24 24">
                              <path className="fill-current text-slate-600" d="M8.07 16H10V8H8.07a8 8 0 110 8z" />
                              <path className="fill-current text-slate-400" d="M15 12L8 6v5H0v2h8v5z" />
                            </svg>
                            <span className={`text-sm font-medium ml-3 duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                              Autenticación
                            </span>
                          </div>
                          {/* Icon */}
                          <div className="flex shrink-0 ml-2">
                            <svg
                              className={`w-3 h-3 shrink-0 ml-1 fill-current text-slate-400 ${open && 'rotate-180'}`}
                              viewBox="0 0 12 12"
                            >
                              <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-9 mt-1 ${!open && 'hidden'}`}>
                          <li className="mb-1 last:mb-0">
                            <button 
                              onClick={onLogout} 
                              className="block text-slate-400 hover:text-slate-200 transition duration-150 truncate"
                            >
                              <span className={`text-sm font-medium duration-200 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                                Salir
                              </span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        {/* Botón expandir/collapse */}
        <div className="pt-3 inline-flex justify-end mt-auto">
          <div className="px-3 py-2">
            <button 
              onClick={() => {
                const newState = !sidebarExpanded;
                setSidebarExpanded(newState);
                localStorage.setItem('sidebar-expanded', newState);
                if (newState) {
                  document.querySelector('body').classList.add('sidebar-expanded');
                } else {
                  document.querySelector('body').classList.remove('sidebar-expanded');
                }
              }}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-200"
            >
              <span className="sr-only">Expandir/Colapsar sidebar</span>
              <svg 
                className={`w-6 h-6 fill-current transition-transform duration-200 ${sidebarExpanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 24 24"
              >
                <path className="text-slate-400" d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z" />
                <path className="text-slate-600" d="M3 23H1V1h2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
