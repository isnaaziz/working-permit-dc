import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

import plnLogo from '../../assets/pln-logo.webp';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-secondary-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-1/3 w-40 h-40 bg-accent-200 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNNDAgMEgwdjQwaDQwVjB6TTEgMWgzOHYzOEgxVjF6IiBmaWxsPSIjZTBlN2ZmIiBmaWxsLW9wYWNpdHk9Ii41Ii8+PC9nPjwvc3ZnPg==')] opacity-50"></div>

      <div className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-16 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <img src={plnLogo} alt="PLN Icon Plus" className="h-16 w-auto mx-auto lg:mx-0 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <i className="ri-shield-check-line"></i>
              <span>Secure Data Center Access Management</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-600 leading-tight mb-6">
              <span className="text-primary-600">BIG</span> Data Center
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Working Permit
              </span>
              <br />
              System
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Streamline your data center access with our comprehensive working permit management system.
              Secure, efficient, and fully compliant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" icon={<i className="ri-arrow-right-line"></i>} iconPosition="right">
                  Request Permit
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" icon={<i className="ri-play-circle-line"></i>}>
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-500">Permits Issued</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">99.9%</div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">24/7</div>
                <div className="text-sm text-gray-500">Support</div>
              </div>
            </div>
          </div>

          {/* Right - Isometric Illustration */}
          <div className="relative">
            <div className="relative z-10">
              {/* Server Rack Illustration */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main Server Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center gap-4">
                      {/* Server Icons */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="w-16 h-20 bg-gradient-to-b from-primary-500 to-primary-700 rounded-lg shadow-lg flex flex-col items-center justify-center">
                          <div className="w-8 h-1 bg-green-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-blue-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-green-400 rounded"></div>
                        </div>
                        <div className="w-16 h-20 bg-gradient-to-b from-secondary-500 to-secondary-700 rounded-lg shadow-lg flex flex-col items-center justify-center">
                          <div className="w-8 h-1 bg-green-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-yellow-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-green-400 rounded"></div>
                        </div>
                        <div className="w-16 h-20 bg-gradient-to-b from-dark-400 to-dark-600 rounded-lg shadow-lg flex flex-col items-center justify-center">
                          <div className="w-8 h-1 bg-green-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-green-400 rounded mb-1"></div>
                          <div className="w-8 h-1 bg-green-400 rounded"></div>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="w-24 h-24 bg-white border-4 border-primary-500 rounded-xl p-2 shadow-lg">
                        <div className="w-full h-full grid grid-cols-4 gap-0.5">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className={`${Math.random() > 0.5 ? 'bg-primary-600' : 'bg-transparent'}`}
                            ></div>
                          ))}
                        </div>
                      </div>

                      <p className="text-primary-600 font-semibold text-sm">Scan to Access</p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent rounded-xl shadow-lg flex items-center justify-center animate-bounce">
                  <i className="ri-shield-check-line text-white text-2xl"></i>
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-success rounded-xl shadow-lg flex items-center justify-center animate-pulse">
                  <i className="ri-check-double-line text-white text-xl"></i>
                </div>
                <div className="absolute top-1/2 -right-8 w-12 h-12 bg-secondary-500 rounded-full shadow-lg flex items-center justify-center">
                  <i className="ri-wifi-line text-white text-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
