import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import SignIn from './SignIn';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { language, setLanguage } = useLanguage();
  const loginSectionRef = useRef<HTMLDivElement>(null);
  const [highlightLogin, setHighlightLogin] = useState(false);

  const t = {
    en: {
      title: 'Simple admin for charities',
      getStarted: 'Get Started for Free',
      features: 'Features',
      about: 'About',
      trackSales: 'Track Sales and Inventory',
      trackSalesDesc: 'Easily manage your charity shop\'s sales and keep track of inventory levels.',
      manageVolunteers: 'Manage Volunteer Hours',
      manageVolunteersDesc: 'Keep track of volunteer contributions and generate reports for your records.',
      generateReports: 'Generate Financial Reports',
      generateReportsDesc: 'Create detailed financial reports to help with decision-making and transparency.',
      secureData: 'Secure Data Storage',
      secureDataDesc: 'Your financial data is securely stored and protected with industry-standard encryption.',
      aboutText: 'CharityAdmin is designed specifically for small charity shops and organizations. Our mission is to simplify financial management, allowing you to focus more on your charitable work and less on administrative tasks.',
      signInWithGoogle: 'Sign in with Google',
      login: 'Login'
    },
    it: {
      title: 'Amministrazione semplice per enti di beneficenza',
      getStarted: 'Inizia Gratuitamente',
      features: 'Funzionalità',
      about: 'Chi Siamo',
      trackSales: 'Traccia Vendite e Inventario',
      trackSalesDesc: 'Gestisci facilmente le vendite del tuo negozio di beneficenza e tieni traccia dei livelli di inventario.',
      manageVolunteers: 'Gestisci Ore di Volontariato',
      manageVolunteersDesc: 'Tieni traccia dei contributi dei volontari e genera rapporti per i tuoi registri.',
      generateReports: 'Genera Rapporti Finanziari',
      generateReportsDesc: 'Crea rapporti finanziari dettagliati per aiutare nel processo decisionale e nella trasparenza.',
      secureData: 'Archiviazione Sicura dei Dati',
      secureDataDesc: 'I tuoi dati finanziari sono archiviati in modo sicuro e protetti con crittografia standard del settore.',
      aboutText: 'CharityAdmin è progettato specificamente per piccoli negozi di beneficenza e organizzazioni. La nostra missione è semplificare la gestione finanziaria, permettendoti di concentrarti di più sul tuo lavoro di beneficenza e meno sui compiti amministrativi.',
      signInWithGoogle: 'Accedi con Google',
      login: 'Accedi'
    }
  }[language];

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'it' : 'en');
  };

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHighlightLogin(true);
    setTimeout(() => setHighlightLogin(false), 3000);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#login') {
      scrollToLogin();
    }
  }, []);

  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">CharityAdmin</div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400 transition duration-300"
            >
              {language === 'en' ? 'IT' : 'EN'}
            </button>
            <button 
              onClick={scrollToLogin} 
              className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition duration-300"
            >
              {t.login}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-500 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-white">{t.title}</h1>
          <button onClick={scrollToLogin} className="bg-white text-blue-500 px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition duration-300">
            {t.getStarted}
          </button>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.trackSales}</h3>
              <p>{t.trackSalesDesc}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.manageVolunteers}</h3>
              <p>{t.manageVolunteersDesc}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.generateReports}</h3>
              <p>{t.generateReportsDesc}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.secureData}</h3>
              <p>{t.secureDataDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-blue-50 py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{t.about}</h2>
          <p className="text-xl text-center max-w-3xl mx-auto">
            {t.aboutText}
          </p>
        </div>
      </section>

      {/* Sign In Section */}
      <section ref={loginSectionRef} className="py-20">
        <div className="container mx-auto max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8">{t.getStarted}</h2>
          <div className={`transition-all duration-300 ${highlightLogin ? 'bg-yellow-100 p-4 rounded-lg' : ''}`}>
            <SignIn />
            <div className="mt-4">
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
              >
                {t.signInWithGoogle}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;