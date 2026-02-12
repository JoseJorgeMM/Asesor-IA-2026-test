import React from 'react';
import { Bot, Mic, Building2, Menu, X } from 'lucide-react';
import { AppMode } from '../types';

interface LayoutProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentMode, onModeChange, children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const NavItem = ({ mode, icon: Icon, label }: { mode: AppMode; icon: any; label: string }) => (
    <button
      onClick={() => {
        onModeChange(mode);
        setIsMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        currentMode === mode
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => onModeChange(AppMode.HOME)}
            >
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Building2 className="text-white h-6 w-6" />
              </div>
              <div className="flex items-center ml-3">
                <span className="text-xl font-bold text-slate-900 tracking-tight">Innova-IA</span>
                <div className="h-6 w-px bg-slate-200 mx-3 hidden sm:block"></div>
                <img 
                  src="https://hvekecuybruzwpjusnkp.supabase.co/storage/v1/object/public/Imagenes/LogoDeveloper.svg" 
                  alt="Jose Jorge Muñoz M. Logo" 
                  className="h-6 w-auto opacity-80 group-hover:opacity-100 transition-opacity hidden sm:block"
                />
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-2">
              <NavItem mode={AppMode.HOME} icon={Building2} label="Inicio" />
              <NavItem mode={AppMode.CHAT} icon={Bot} label="Asistente Chat" />
              <NavItem mode={AppMode.VOICE} icon={Mic} label="Llamada Real" />
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2 shadow-lg">
            <NavItem mode={AppMode.HOME} icon={Building2} label="Inicio" />
            <NavItem mode={AppMode.CHAT} icon={Bot} label="Asistente Chat" />
            <NavItem mode={AppMode.VOICE} icon={Mic} label="Llamada Real" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-4">
          <div className="text-center text-slate-500 text-sm">
            <p>© 2024 Innova-IA. Potenciando empresas con Gemini.</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2 group">
            <div className="flex items-center space-x-2 text-slate-400 text-xs tracking-wide uppercase font-medium transition-colors group-hover:text-slate-600">
              <span>developed by</span>
              <span className="font-bold text-slate-500 group-hover:text-indigo-600">Jose Jorge Muñoz M.</span>
            </div>
            <img 
              src="https://hvekecuybruzwpjusnkp.supabase.co/storage/v1/object/public/Imagenes/LogoDeveloper.svg" 
              alt="Jose Jorge Muñoz M. Logo" 
              className="h-8 w-auto grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};