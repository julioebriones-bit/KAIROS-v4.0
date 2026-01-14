
import React, { useState } from 'react';
import { ModuleType } from '../types';
import { 
  Trophy, Activity, Target, Globe, Hexagon, Radar, Flame, 
  GraduationCap, MapPin, Zap, Cpu, Shield, 
  BarChart3, LucideIcon, Footprints, Anchor, School
} from 'lucide-react';

interface ModuleSelectorProps {
  onSelect: (module: ModuleType) => void;
  disabled: boolean;
  currentModule?: ModuleType;
  compact?: boolean;
}

interface ModuleConfig {
  id: ModuleType;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  status: 'active' | 'inactive' | 'beta' | 'maintenance';
  signalStrength?: number;
}

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({ 
  onSelect, 
  disabled,
  currentModule,
  compact = false
}) => {
  const [loadingModules, setLoadingModules] = useState<Set<ModuleType>>(new Set());

  const modules: ModuleConfig[] = [
    { 
      id: ModuleType.GENERAL, 
      label: 'OMNI SCAN',
      description: 'Escaneo global multi-deporte',
      icon: Radar,
      color: 'from-white to-gray-300',
      bgGradient: 'from-gray-900/90 to-black',
      borderColor: 'border-white/30',
      textColor: 'text-white',
      glowColor: 'shadow-[0_0_30px_rgba(255,255,255,0.3)]',
      status: 'active',
      signalStrength: 100
    },
    { 
      id: ModuleType.NBA, 
      label: 'NBA PACER',
      description: 'Análisis baloncesto NBA',
      icon: Target,
      color: 'from-orange-500 to-amber-400',
      bgGradient: 'from-orange-950/80 to-black',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-300',
      glowColor: 'shadow-[0_0_25px_rgba(249,115,22,0.4)]',
      status: 'active',
      signalStrength: 96
    },
    { 
      id: ModuleType.NCAA, 
      label: 'NCAA VARSITY',
      description: 'Basket y Football Universitario',
      icon: School,
      color: 'from-blue-400 to-indigo-500',
      bgGradient: 'from-blue-950/80 to-black',
      borderColor: 'border-blue-400/40',
      textColor: 'text-blue-200',
      glowColor: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]',
      status: 'active',
      signalStrength: 89
    },
    { 
      id: ModuleType.LMB, 
      label: 'LMB MONEYBALL',
      description: 'Beisbol mexicano con AI',
      icon: Flame,
      color: 'from-red-500 to-orange-500',
      bgGradient: 'from-red-950/80 to-black',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-300',
      glowColor: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
      status: 'active',
      signalStrength: 92
    },
    { 
      id: ModuleType.NFL, 
      label: 'NFL GRIDIRON',
      description: 'Análisis de impacto y yardaje',
      icon: Footprints,
      color: 'from-blue-600 to-red-500',
      bgGradient: 'from-blue-950/80 to-black',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      glowColor: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]',
      status: 'active',
      signalStrength: 94
    },
    { 
      id: ModuleType.SOCCER_EUROPE, 
      label: 'ATLAS EUROPA',
      description: 'Fútbol europeo premium',
      icon: Globe,
      color: 'from-emerald-500 to-green-400',
      bgGradient: 'from-emerald-950/80 to-black',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-300',
      glowColor: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]',
      status: 'active',
      signalStrength: 85
    }
  ];

  const handleModuleClick = (module: ModuleType) => {
    if (disabled || loadingModules.has(module)) return;
    setLoadingModules(prev => new Set(prev).add(module));
    setTimeout(() => {
      onSelect(module);
      setLoadingModules(prev => {
        const n = new Set(prev);
        n.delete(module);
        return n;
      });
    }, 600);
  };

  const getStatusIndicator = (status: ModuleConfig['status']) => {
    switch (status) {
      case 'active': return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>;
      case 'beta': return <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7] animate-pulse"></div>;
      case 'maintenance': return <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b] animate-pulse"></div>;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>;
    }
  };

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-6 text-center">
          <h2 className="text-lg font-mono font-black text-white mb-2 flex items-center justify-center gap-2 tracking-[0.2em]">
            <Cpu className="w-5 h-5 text-virtus-aztecCyan animate-pulse" />
            VECTORES DE INTELIGENCIA V4.0
            <Shield className="w-5 h-5 text-virtus-aztecCyan" />
          </h2>
          <p className="text-[10px] text-gray-500 font-mono max-w-2xl mx-auto uppercase tracking-widest">
            Sincronización bilateral activa. REGLA DE ORO (28-SEP) habilitada por defecto.
          </p>
        </div>
      )}
      
      <div className={`
        ${compact 
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3' 
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        }
        w-full max-w-7xl mx-auto
      `}>
        {modules.map(module => (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id)}
            disabled={disabled || module.status === 'inactive'}
            className={`
              relative group flex flex-col p-5 rounded-2xl border
              ${module.bgGradient} ${module.borderColor} ${module.textColor}
              transition-all duration-300 backdrop-blur-sm
              ${disabled || module.status === 'inactive' ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-2xl'}
              ${currentModule === module.id ? `${module.glowColor} scale-[1.02] border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]` : ''}
              min-h-[120px]
            `}
          >
            {loadingModules.has(module.id) && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl z-20">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="flex items-start justify-between relative z-10 w-full">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 group-hover:border-white/30 transition-colors shadow-inner">
                  <module.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-black font-mono text-sm tracking-tighter uppercase">{module.label}</div>
                  {!compact && (
                    <div className="text-[8px] text-gray-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                      {getStatusIndicator(module.status)} {module.status}
                    </div>
                  )}
                </div>
              </div>
              {!compact && module.signalStrength && (
                <div className="text-[10px] font-mono font-bold flex items-center gap-1 opacity-60">
                  <Activity className="w-3 h-3" /> {module.signalStrength}%
                </div>
              )}
            </div>
            
            {!compact && (
              <div className="relative z-10 mt-4">
                <p className="text-[10px] text-gray-400 leading-relaxed font-mono uppercase tracking-tighter">{module.description}</p>
                {module.signalStrength && (
                  <div className="mt-3">
                    <div className="h-1 bg-black/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r ${module.color} transition-all duration-700`}
                        style={{ width: `${module.signalStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {currentModule === module.id && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-virtus-aztecCyan rounded-full animate-ping"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
