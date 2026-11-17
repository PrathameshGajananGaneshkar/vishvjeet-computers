import React from 'react';
import { 
  Wrench, 
  Cpu, 
  HardDrive, 
  Printer, 
  Camera, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Search
} from 'lucide-react';
import { initialServices } from '../data/seedData';
import { useLanguage } from '../context/LanguageContext';

interface ServicesSectionProps {
  onBookService: (serviceName?: string) => void;
  onTrackService: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onBookService,
  onTrackService,
}) => {
  const { language, t } = useLanguage();

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench': return <Wrench className="w-6 h-6 text-blue-700" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-amber-600" />;
      case 'HardDrive': return <HardDrive className="w-6 h-6 text-indigo-600" />;
      case 'Printer': return <Printer className="w-6 h-6 text-emerald-600" />;
      case 'Camera': return <Camera className="w-6 h-6 text-rose-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-purple-600" />;
      default: return <Wrench className="w-6 h-6 text-blue-700" />;
    }
  };

  return (
    <section className="py-12 bg-slate-900 text-white rounded-3xl my-8 mx-4 max-w-7xl lg:mx-auto p-6 md:p-12 relative overflow-hidden shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl mb-10">
        <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 border border-amber-400/30">
          <Wrench className="w-3.5 h-3.5" />
          <span>Local Chikhli Workshop Support</span>
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mt-3 text-white">
          {t('servicesHeading')}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
          {t('servicesSub')}
        </p>

        {/* Quick actions bar */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => onBookService()}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <span>{t('bookServiceNow')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onTrackService}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <Search className="w-4 h-4 text-amber-300" />
            <span>{t('checkServiceStatus')}</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {initialServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 hover:border-blue-500/80 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-700/60 rounded-xl group-hover:scale-110 transition-transform">
                  {getServiceIcon(srv.iconName)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md">
                  {srv.category}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors leading-snug">
                {language === 'mr' ? srv.nameMr : srv.name}
              </h3>

              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                {language === 'mr' ? srv.descriptionMr : srv.description}
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {srv.estimatedTime}
                </span>
                <span className="font-bold text-amber-300 text-[11px]">
                  {language === 'mr' ? srv.priceNoteMr : srv.priceNote}
                </span>
              </div>

              <button
                onClick={() => onBookService(srv.name)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Book This Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
