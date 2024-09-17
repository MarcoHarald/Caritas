import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import SignIn from './SignIn';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { language } = useLanguage();

  const t = {
    en: {
      title: 'Financial Tracking Made Easy for Charities',
      subtitle: 'Streamline your financial management and focus on what matters most - your cause.',
      getStarted: 'Get Started for Free',
      // Add more translations as needed
    },
    it: {
      title: 'Gestione Finanziaria Semplificata per Enti di Beneficenza',
      subtitle: 'Ottimizza la tua gestione finanziaria e concentrati su ciò che conta di più: la tua causa.',
      getStarted: 'Inizia Gratuitamente',
      // Add more translations as needed
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

  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">CharityTracker</div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#features" className="hover:text-blue-200">Features</a></li>
              <li><a href="#about" className="hover:text-blue-200">About</a></li>
              <li><a href="#pricing" className="hover:text-blue-200">Pricing</a></li>
              <li><a href="#contact" className="hover:text-blue-200">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-500 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl mb-8">{t.subtitle}</p>
          <button onClick={handleGoogleSignIn} className="bg-white text-blue-500 px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition duration-300">
            {t.getStarted}
          </button>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Sales and Inventory</h3>
              <p>Easily manage your charity shop's sales and keep track of inventory levels.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Volunteer Hours</h3>
              <p>Keep track of volunteer contributions and generate reports for your records.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Financial Reports</h3>
              <p>Create detailed financial reports to help with decision-making and transparency.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customizable to Your Needs</h3>
              <p>Tailor the system to fit your charity's unique requirements and workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-blue-50 py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">About CharityTracker</h2>
          <p className="text-xl text-center max-w-3xl mx-auto">
            CharityTracker is designed specifically for small charity shops and organizations. Our mission is to simplify financial management, allowing you to focus more on your charitable work and less on administrative tasks.
          </p>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-4">"CharityTracker has revolutionized how we manage our finances. It's user-friendly and saves us so much time!"</p>
              <p className="font-semibold">- Jane Doe, Local Food Bank</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-4">"The volunteer tracking feature is a game-changer. We can now easily recognize and reward our most dedicated volunteers."</p>
              <p className="font-semibold">- John Smith, Animal Shelter</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="mb-4">"The customizable reports have made our board meetings so much more productive. Highly recommended!"</p>
              <p className="font-semibold">- Emily Brown, Youth Mentoring Program</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-blue-50 py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <p className="text-4xl font-bold mb-6">$0<span className="text-xl font-normal">/month</span></p>
              <ul className="mb-8">
                <li className="mb-2">✓ Track up to 100 transactions</li>
                <li className="mb-2">✓ Basic reporting</li>
                <li className="mb-2">✓ 1 user account</li>
              </ul>
              <button onClick={handleGoogleSignIn} className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">Get Started</button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-blue-500">
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-4xl font-bold mb-6">$29<span className="text-xl font-normal">/month</span></p>
              <ul className="mb-8">
                <li className="mb-2">✓ Unlimited transactions</li>
                <li className="mb-2">✓ Advanced reporting</li>
                <li className="mb-2">✓ 5 user accounts</li>
                <li className="mb-2">✓ Volunteer tracking</li>
              </ul>
              <button onClick={handleGoogleSignIn} className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">Start Free Trial</button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <ul className="mb-8">
                <li className="mb-2">✓ All Pro features</li>
                <li className="mb-2">✓ Custom integrations</li>
                <li className="mb-2">✓ Dedicated support</li>
                <li className="mb-2">✓ Unlimited users</li>
              </ul>
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Charity's Finances?</h2>
          <p className="text-xl mb-8">Join thousands of charities already benefiting from CharityTracker.</p>
          <button onClick={handleGoogleSignIn} className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-100 transition duration-300">
            Sign Up Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-10">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CharityTracker</h3>
            <p>Empowering charities through smart financial management.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul>
              <li><a href="#features" className="hover:text-blue-300">Features</a></li>
              <li><a href="#about" className="hover:text-blue-300">About</a></li>
              <li><a href="#pricing" className="hover:text-blue-300">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul>
              <li><a href="#" className="hover:text-blue-300">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-300">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-300">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul>
              <li><a href="#" className="hover:text-blue-300">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-300">Facebook</a></li>
              <li><a href="#" className="hover:text-blue-300">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; 2023 CharityTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;