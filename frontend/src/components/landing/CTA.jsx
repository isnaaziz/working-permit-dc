import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const CTA = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 text-center">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of companies that trust our system for secure data center access management.
              Request your first permit today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  variant="accent" 
                  size="lg"
                  icon={<i className="ri-arrow-right-line"></i>}
                  iconPosition="right"
                >
                  Request Permit Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-white border-2 border-white/30 hover:bg-white/10"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
