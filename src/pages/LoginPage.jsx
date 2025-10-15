import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import LogoEdoMex from "../images/logos_edomex3.png";
import LogoIsem from "../images/escudo-edomex.png";
import Ondas from "../images/ondas3.svg";
import Swal from "sweetalert2";

const backgroundLogin = {
  backgroundImage: 'url(' + Ondas + ')',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%'
}

const AnimatedShapes = () => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-red-900 to-colorPrimario">
      <style>
        {`
          @keyframes float1 {
            0% { transform: translate(0, 0) rotate(0deg) scale(1); }
            25% { transform: translate(20px, 20px) rotate(5deg) scale(1.1); }
            50% { transform: translate(0, 40px) rotate(0deg) scale(1); }
            75% { transform: translate(-20px, 20px) rotate(-5deg) scale(0.9); }
            100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          }
          @keyframes monitorGlow {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255,255,255,0.3)); }
            50% { filter: brightness(1.3) drop-shadow(0 0 5px rgba(255,255,255,0.5)); }
          }
          @keyframes monitorScreen {
            0% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.02); }
            100% { opacity: 0.3; transform: scale(1); }
          }
          @keyframes scanLine {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            25% { transform: translate(30px, -20px) scale(1.1) rotate(5deg); }
            50% { transform: translate(0, -40px) scale(1) rotate(0deg); }
            75% { transform: translate(-30px, -20px) scale(0.9) rotate(-5deg); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            50% { transform: translate(-30px, 30px) rotate(180deg) scale(1.2); }
          }
          @keyframes float4 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            50% { transform: translate(20px, -30px) scale(1.2) rotate(90deg); }
          }
          @keyframes float5 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            33% { transform: translate(25px, 15px) rotate(120deg) scale(1.1); }
            66% { transform: translate(-15px, 25px) rotate(240deg) scale(0.9); }
          }
          @keyframes float6 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            50% { transform: translate(-25px, -15px) scale(0.8) rotate(-45deg); }
          }
          @keyframes float7 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            50% { transform: translate(15px, 25px) rotate(45deg) scale(1.1); }
          }
          @keyframes float8 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            50% { transform: translate(-20px, -20px) rotate(-45deg) scale(0.9); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }
          @keyframes ledBlink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          .animate-float1 {
            fill: rgba(255, 255, 255, 0.2);
            animation: float1 15s ease-in-out infinite, monitorGlow 4s ease-in-out infinite;
          }
          .monitor-screen {
            fill: rgba(255, 255, 255, 0.1);
            animation: monitorScreen 3s ease-in-out infinite;
            position: relative;
            overflow: hidden;
          }
          .scan-line {
            position: absolute;
            width: 100%;
            height: 2px;
            background: rgba(255, 255, 255, 0.2);
            animation: scanLine 2s linear infinite;
          }
          .animate-float2 {
            fill: rgba(255, 255, 255, 0.15);
            animation: float2 12s ease-in-out infinite, pulse 3s ease-in-out infinite;
          }
          .animate-float3 {
            fill: rgba(255, 255, 255, 0.1);
            animation: float3 20s ease-in-out infinite, pulse 5s ease-in-out infinite;
          }
          .animate-float4 {
            fill: rgba(255, 255, 255, 0.25);
            animation: float4 18s ease-in-out infinite, pulse 4.5s ease-in-out infinite;
          }
          .animate-float5 {
            fill: rgba(255, 255, 255, 0.2);
            animation: float5 22s ease-in-out infinite, pulse 3.5s ease-in-out infinite;
          }
          .animate-float6 {
            fill: rgba(255, 255, 255, 0.18);
            animation: float6 16s ease-in-out infinite, pulse 4.2s ease-in-out infinite;
          }
          .animate-float7 {
            fill: rgba(255, 255, 255, 0.22);
            animation: float7 19s ease-in-out infinite, pulse 3.8s ease-in-out infinite;
          }
          .animate-float8 {
            fill: rgba(255, 255, 255, 0.17);
            animation: float8 17s ease-in-out infinite, pulse 4.7s ease-in-out infinite;
          }
          .led {
            animation: ledBlink 1s ease-in-out infinite;
          }
        `}
      </style>
      <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Monitor/Computadora */}
        <g className="animate-float1">
          <rect x="0" y="0" width="15" height="12" rx="1" />
          <rect x="1" y="1" width="13" height="10" rx="0.5" className="monitor-screen">
            <rect className="scan-line" />
          </rect>
          <rect x="2" y="12" width="11" height="2" />
          <line x1="5" y1="14" x2="10" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <circle cx="7" cy="5" r="0.5" className="led" fill="rgba(255,255,255,0.4)" />
          <line x1="4" y1="8" x2="10" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
          <circle cx="4" cy="5" r="0.3" className="led" fill="rgba(255,255,255,0.3)" />
          <circle cx="10" cy="5" r="0.3" className="led" fill="rgba(255,255,255,0.3)" />
        </g>

        {/* Servidor */}
        <g className="animate-float2">
          <rect x="60" y="30" width="12" height="15" rx="1" />
          <line x1="62" y1="33" x2="70" y2="33" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="62" y1="36" x2="70" y2="36" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="62" y1="39" x2="70" y2="39" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
        </g>

        {/* Disco Duro */}
        <g className="animate-float3">
          <rect x="40" y="60" width="10" height="8" rx="1" />
          <circle cx="45" cy="64" r="2" fill="rgba(255,255,255,0.2)" />
        </g>

        {/* Router/Red */}
        <g className="animate-float4">
          <rect x="70" y="60" width="12" height="8" rx="1" />
          <circle cx="73" cy="64" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="76" cy="64" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="79" cy="64" r="0.8" fill="rgba(255,255,255,0.3)" />
        </g>

        {/* Laptop */}
        <g className="animate-float5">
          <rect x="30" y="40" width="14" height="10" rx="1" />
          <rect x="32" y="50" width="10" height="1" />
          <line x1="34" y1="51" x2="40" y2="51" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        </g>

        {/* Impresora */}
        <g className="animate-float6">
          <rect x="80" y="20" width="12" height="8" rx="1" />
          <rect x="82" y="22" width="8" height="4" rx="0.5" />
          <line x1="84" y1="26" x2="88" y2="26" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        </g>

        {/* Teclado */}
        <g className="animate-float1">
          <rect x="15" y="70" width="16" height="6" rx="1" />
          <line x1="17" y1="72" x2="29" y2="72" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" />
          <line x1="17" y1="74" x2="29" y2="74" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" />
        </g>

        {/* Mouse */}
        <g className="animate-float2">
          <ellipse cx="85" cy="85" rx="3" ry="2" />
          <line x1="85" y1="83" x2="85" y2="87" stroke="rgba(255,255,255,0.2)" strokeWidth="0.2" />
        </g>

        {/* UPS/Batería */}
        <g className="animate-float3">
          <rect x="50" y="80" width="8" height="12" rx="1" />
          <line x1="52" y1="82" x2="56" y2="82" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <line x1="52" y1="84" x2="56" y2="84" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
          <line x1="52" y1="86" x2="56" y2="86" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        </g>

        {/* Switch de Red */}
        <g className="animate-float4">
          <rect x="65" y="80" width="10" height="8" rx="1" />
          <circle cx="68" cy="84" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="72" cy="84" r="0.8" fill="rgba(255,255,255,0.3)" />
        </g>

        {/* Cámara Web */}
        <g className="animate-float7">
          <circle cx="90" cy="40" r="2" />
          <rect x="88" y="42" width="4" height="2" rx="0.5" />
        </g>

        {/* Hub USB */}
        <g className="animate-float8">
          <rect x="10" y="40" width="6" height="4" rx="0.5" />
          <line x1="11" y1="41" x2="15" y2="41" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
          <line x1="11" y1="43" x2="15" y2="43" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
        </g>

        {/* Memoria RAM */}
        <g className="animate-float7">
          <rect x="75" y="40" width="8" height="12" rx="0.5" />
          <line x1="77" y1="42" x2="81" y2="42" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
          <line x1="77" y1="44" x2="81" y2="44" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
          <line x1="77" y1="46" x2="81" y2="46" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
        </g>

        {/* Proyector */}
        <g className="animate-float8">
          <rect x="20" y="85" width="12" height="8" rx="1" />
          <circle cx="26" cy="89" r="2" fill="rgba(255,255,255,0.2)" />
          <line x1="24" y1="87" x2="28" y2="87" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
        </g>

        {/* Scanner */}
        <g className="animate-float6">
          <rect x="40" y="85" width="10" height="6" rx="0.5" />
          <line x1="42" y1="87" x2="48" y2="87" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
          <line x1="42" y1="89" x2="48" y2="89" stroke="rgba(255,255,255,0.3)" strokeWidth="0.2" />
        </g>
      </svg>
    </div>
  );
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (result.meta.requestStatus === "fulfilled") {
      Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/dashboard");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: error || "Verifica tus datos e intenta nuevamente",
      });
    }
  };

  return (
    <main className="bg-gradient-to-r from-red-900 from-1% via-colorPrimario via-95% to-colorPrimario to-90%">
      <div style={backgroundLogin}>
        <div className="grid grid-cols-12">
          {/* Image */}
          <div className="hidden md:block col-span-6 top-0 bottom-0 left-0 h-svh" aria-hidden="true">
            <AnimatedShapes />
            <img className="absolute top-10 left-0 mr-12 hidden lg:block" src={LogoIsem} width="150" height="330" alt="Authentication decoration" />
          </div>

          {/* Content */}
          <div className="md:col-span-6 col-span-12 h-svh">
            <div className="min-h-screen h-full flex flex-col after:flex-1">
              {/* Header */}
              <div className="flex-1 mt-6">
                <div className='flex items-center justify-center'>
                  <img className="" src={LogoEdoMex} width="200" height="330" alt="Authentication decoration" />
                </div>
              </div>

              <div className="max-w-sm mx-auto px-4 py-8 pt-12">
                <div 
                  className={`bg-white/10 backdrop-blur-sm rounded-lg p-6 transition-all duration-500 ease-in-out cursor-pointer transform ${
                    isExpanded ? 'scale-100' : 'scale-95'
                  }`}
                  onClick={() => setIsExpanded(true)}
                >
                  <h1 className="text-3xl font-bold mb-8 text-center text-white">SISCONIN</h1>
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <h2 className="text-xl font-semibold mb-6 text-center text-white">Sistema de Control de Inventarios</h2>
                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="space-y-4">
                        <div>
                          <div className="relative z-0 mb-6 w-full group">
                            <input
                              type="text"
                              id="email"
                              className={`block py-2.5 px-0 w-full text-lg text-gray-100 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-gray focus:outline-none focus:ring-0 ${
                                !errors.email?.message ? 'focus:border-colorSecundario' : 'focus:border-red-400'
                              } peer`}
                              placeholder=" "
                              autoComplete="off"
                              {...register("email", {
                                required: "Este campo es necesario",
                              })}
                            />
                            <label
                              htmlFor="email"
                              className={`peer-focus:font-medium absolute text-lg text-gray-300 dark:text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 ${
                                !errors.email?.message ? 'peer-focus:text-colorSecundario' : 'peer-focus:text-red-400'
                              } peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                            >
                              Usuario
                            </label>
                            <div className="w-full text-red-400 text-sm pb-2">
                              {errors.email?.message}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="relative z-0 mb-6 w-full group">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              className={`block py-2.5 px-0 w-full text-lg text-gray-100 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-gray focus:outline-none focus:ring-0 ${
                                !errors.password?.message ? 'focus:border-colorSecundario' : 'focus:border-red-400'
                              } peer`}
                              placeholder=" "
                              autoComplete="off"
                              {...register("password", {
                                required: "Este campo es necesario",
                                minLength: {
                                  value: 4,
                                  message: "Tu contraseña debe tener al menos 8 caracteres"
                                }
                              })}
                            />
                            <label
                              htmlFor="password"
                              className={`peer-focus:font-medium absolute text-lg text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 ${
                                !errors.password?.message ? 'peer-focus:text-colorSecundario' : 'peer-focus:text-red-400'
                              } peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6`}
                            >
                              Contraseña
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-colorSecundario focus:outline-none"
                            >
                              {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                            <div className="w-full text-red-400 text-sm pb-2">
                              {errors.password?.message}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center md:justify-between justify-center mt-16">
                        <div className="mr-1">
                        </div>
                        <button
                          type='submit'
                          className="text-colorSecundario hover:text-white border-2 hover:border-colorSecundario border-colorSecundario focus:ring-2 focus:outline-none focus:ring-colorSecundario font-medium rounded-lg px-5 py-2.5 text-center mr-2 mb-2 w-28 sm:w-48"
                        >
                          {loading ? "Cargando..." : "Ingresar"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <footer className="text-center text-white mt-8">
                Secretaría de Bienestar
                <br />
                Dirección General de Desarrollo Institucional y Tecnologías de la Información
              </footer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
