import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { VoiceInterface } from './components/VoiceInterface';
import { AppMode } from './types';
import { Sparkles, Zap, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  const renderHome = () => (
    <div className="space-y-16 py-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
          <Sparkles size={16} className="mr-2" />
          Revoluciona tu Empresa con Innova-IA
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Inteligencia Artificial <br />
          <span className="text-indigo-600">Para el Futuro Corporativo</span>
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Descubre cómo la IA Generativa puede transformar cada departamento de tu organización. 
          Interactúa con nuestros asistentes virtuales especializados.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={() => setMode(AppMode.CHAT)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            Consultar al Chat
          </button>
          <button 
            onClick={() => setMode(AppMode.VOICE)}
            className="px-8 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all active:scale-95"
          >
            Hablar con Experta
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {[
          {
            icon: Zap,
            title: "Automatización Total",
            desc: "Optimiza flujos de trabajo en RRHH y Finanzas con agentes inteligentes."
          },
          {
            icon: Globe,
            title: "Alcance Global",
            desc: "Rompe barreras de idioma y crea contenido multilingüe al instante."
          },
          {
            icon: Sparkles,
            title: "Creatividad Sin Límites",
            desc: "Genera campañas de marketing y diseños de productos en segundos."
          }
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
            <p className="text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout currentMode={mode} onModeChange={setMode}>
      {mode === AppMode.HOME && renderHome()}
      {mode === AppMode.CHAT && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ChatInterface />
        </div>
      )}
      {mode === AppMode.VOICE && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
          <VoiceInterface />
        </div>
      )}
    </Layout>
  );
};

export default App;