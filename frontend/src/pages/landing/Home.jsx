import React from 'react';
import { Navbar, Hero, Features, HowItWorks, Testimonials, FAQ, CTA, Footer } from '../../components/landing';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
