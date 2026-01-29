import React from 'react';
import { Navbar, Features, Footer } from '../../components/landing';

const Services = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-secondary-50 to-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-600 mb-6">
              Our <span className="text-primary-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions for secure data center access management
            </p>
          </div>
        </section>

        {/* Features */}
        <Features />
      </main>

      <Footer />
    </div>
  );
};

export default Services;
