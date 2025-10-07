'use client';

import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter',sans-serif]">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">ERP SaaS</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              <a href="#home" className="text-slate-600 hover:text-indigo-600 transition-colors">Home</a>
              <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#contact" className="text-slate-600 hover:text-indigo-600 transition-colors">Contact</a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <a href="/auth/login" className="text-slate-600 hover:text-indigo-600 transition-colors">Login</a>
              <a href="/auth/register" className="bg-indigo-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-2xl hover:bg-indigo-700 shadow-sm transition-colors">
                Get Started
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 mt-4 pt-4">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#contact" className="text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                <hr className="border-slate-200" />
                <a href="/auth/login" className="text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</a>
                <a href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:bg-indigo-700 shadow-sm transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-slate-50 to-indigo-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
            Empower Your Business with Smart ERP
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Comprehensive ERP solution with HRM, Payroll, Finance, and more.
            Multi-tenant SaaS platform for growing businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a href="/auth/register" className="bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-2xl text-base sm:text-lg hover:bg-indigo-700 shadow-sm transition-colors w-full sm:w-auto text-center">
              Start Free Trial
            </a>
            <button className="border border-slate-300 text-slate-700 px-6 sm:px-8 py-3 rounded-2xl text-base sm:text-lg hover:bg-slate-50 shadow-sm transition-colors w-full sm:w-auto">
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-8 sm:mb-12">Complete ERP Modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👥</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900">HRM</h3>
              <p className="text-sm sm:text-base text-slate-600">Employee management, attendance, leave, payroll</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💰</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900">Finance</h3>
              <p className="text-sm sm:text-base text-slate-600">Accounting, invoicing, expense tracking</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900">Inventory</h3>
              <p className="text-sm sm:text-base text-slate-600">Stock management, procurement, reporting</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤝</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900">CRM</h3>
              <p className="text-sm sm:text-base text-slate-600">Customer relations, sales pipeline, support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-8 sm:mb-12">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Starter</h3>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">$29<span className="text-base sm:text-lg text-slate-600">/month</span></div>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">Perfect for small businesses</p>
              <ul className="space-y-2 mb-6 sm:mb-8">
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>Up to 50 employees</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>Basic HRM features</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>Email support</li>
              </ul>
              <button className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl hover:bg-slate-200 transition-colors text-sm sm:text-base">Get Started</button>
            </div>
            <div className="bg-indigo-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg relative">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">Popular</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Professional</h3>
              <div className="text-3xl sm:text-4xl font-bold mb-2">$99<span className="text-base sm:text-lg opacity-80">/month</span></div>
              <p className="opacity-80 mb-4 sm:mb-6 text-sm sm:text-base">For growing companies</p>
              <ul className="space-y-2 mb-6 sm:mb-8">
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-400 mr-2">✓</span>Up to 200 employees</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-400 mr-2">✓</span>Full ERP modules</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-400 mr-2">✓</span>Priority support</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-400 mr-2">✓</span>Advanced analytics</li>
              </ul>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl hover:bg-slate-50 font-semibold transition-colors text-sm sm:text-base">Get Started</button>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Enterprise</h3>
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">Custom</div>
              <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">For large organizations</p>
              <ul className="space-y-2 mb-6 sm:mb-8">
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>Unlimited employees</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>All modules included</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>Dedicated support</li>
                <li className="flex items-center text-sm sm:text-base"><span className="text-emerald-500 mr-2">✓</span>Custom integrations</li>
              </ul>
              <button className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl hover:bg-slate-200 transition-colors text-sm sm:text-base">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="text-xl sm:text-2xl font-bold mb-4">ERP SaaS</div>
              <p className="text-slate-400 text-sm sm:text-base">Empowering businesses with smart ERP solutions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm sm:text-base">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-slate-400">
            <p className="text-sm sm:text-base">&copy; 2024 ERP SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
