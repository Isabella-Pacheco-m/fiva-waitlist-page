import { useState } from 'react'
import { WaitlistForm } from './components/waitlist-form'
import logo from './assets/images/logo.png'
import illustration from './assets/animation/bulb-animation.mp4'
import bandera from './assets/images/bandera.png'
import bgPattern from './assets/images/bg-img.png'

function App() {
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <main className="min-h-screen lg:h-screen w-full bg-white relative lg:overflow-hidden flex flex-col font-sans selection:bg-yellow-50 italic-none">

      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="relative z-10 flex flex-col h-full">

        <header className="w-full flex justify-center py-0 shrink-0">
          <img
            src={logo}
            alt="FIVA Logo"
            className="h-20 sm:h-24 lg:h-32 object-contain"
          />
        </header>


        {!showPrivacy ? (
          <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 w-full lg:items-center">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center h-full w-full">


              <div className="lg:col-span-6 flex flex-col justify-center gap-6 lg:gap-7 order-1 z-20 py-10 lg:py-0 lg:mb-16">

                <div className="inline-flex items-center gap-2.5 bg-[#FEF9E7] border border-[#F5C423] rounded-full px-4 py-1.5 w-fit">
                  <img src={bandera} alt="CO" className="w-5 h-auto object-contain rounded-sm" />
                  <span className="text-[#F5C423] font-bold text-xs sm:text-sm tracking-widest uppercase">AGOSTO 2026</span>
                </div>


                <h1 className="text-4xl sm:text-6xl lg:text-[45px] xl:text-[45px] 
                              font-black text-[#1A1A1A] tracking-tight
                              leading-tight">
                  Convertimos{" "}
                  <span className="bg-[#F5C423] text-white px-3.5 py-0.5 rounded-full inline-block">
                    data
                  </span>
                  <br className="hidden sm:block" />
                  <span className="bg-[#F5C423] text-white px-3.5 py-0.5 rounded-full inline-block mt-2">
                    criolla
                  </span>{" "}
                  en decisiones con{" "}
                  <span className="text-[#F5C423] font-black">{">"}98% precisión</span>
                </h1>



                <div className="max-w-lg">
                  <p className="text-gray-500 text-base sm:text-lg leading-relaxed font-light">
                    <span className="font-bold text-gray-500">No es magia,</span> trabajamos con{" "}
                    <span className="font-bold text-gray-500">data real del mercado colombiano</span>
                    : la recolectamos, limpiamos y visualizamos para lograr una toma de{" "}
                    <span className="font-bold text-gray-500">decisiones</span> estratégica.
                  </p>
                </div>


                <div className="space-y-4">
                  <p className="font-bold text-[#1A1A1A] text-lg">
                    Pronto lanzaremos, mientras tanto únete a
                    <br className="hidden sm:block" />
                    nuestra lista de espera
                  </p>
                  <div className="max-w-md">
                    <WaitlistForm />
                  </div>
                </div>


                <div className="flex items-center gap-4 pt-4">
                  <span className="text-[10px] font-black text-gray-900 tracking-[0.15em] uppercase">SÍGUENOS EN</span>
                  <div className="flex items-center gap-4">

                    <a href="https://linkedin.com/company/fiva-co" target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                      <div className="bg-[#F5C423] w-6 h-6 rounded-md flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                        </svg>
                      </div>
                    </a>

                    <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                      <div className="bg-[#F5C423] w-6 h-6 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                    </a>

                    <a href="https://instagram.com/fiva.co" target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                      <div className="bg-[#F5C423] w-6 h-6 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <circle cx="12" cy="12" r="4" />
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                        </svg>
                      </div>
                    </a>
                  </div>
                </div>
              </div>


              <div className="lg:col-span-6 flex justify-center lg:justify-end items-end h-full order-2 lg:order-2 relative mt-8 lg:mt-0 border-solid">
                <video
                  src={illustration}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full sm:w-[90%] lg:w-[125%] lg:max-w-none h-auto object-contain object-bottom pointer-events-none select-none relative z-10 border-none shadow-none outline-none"
                  style={{ marginBottom: '-1px' }}
                />
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full lg:overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-4 pt-10">
            <button onClick={() => setShowPrivacy(false)} className="mb-6 text-[#F5C423] font-bold flex items-center gap-2">
              ← Volver
            </button>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8">Políticas de <span className="text-[#F5C423]">Privacidad</span></h2>
            <div className="bg-white/80 rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-xl space-y-6 text-gray-500 font-medium">
              <p className="text-xl font-bold text-gray-900">Privacidad exclusiva para <span className="text-[#F5C423]">FIVA</span>.</p>
              <p>Sus datos corporativos y de contacto se usarán únicamente para análisis de público y comunicaciones oficiales de FIVA. No los compartimos con terceros.</p>
            </div>
          </div>
        )}


        {/* Footer */}
        <footer className="absolute bottom-4 left-0 right-0 py-4 px-10 z-40 bg-transparent pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-row justify-between items-center pointer-events-auto">
            <p className="text-[10px] sm:text-[11px] font-medium text-gray-300 tracking-[0.1em] uppercase">
              © 2026 FIVA.
            </p>
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-[10px] sm:text-[11px] font-medium text-gray-400 hover:text-[#F5C423] transition-colors uppercase tracking-[0.2em]"
            >
              Privacidad
            </button>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  )
}

export default App