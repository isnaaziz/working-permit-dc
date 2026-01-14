import React from 'react';
import { Navbar, Footer } from '../../components/landing';
import { Card } from '../../components/ui';

const About = () => {
  const team = [
    { name: 'Ahmad Fauzi', role: 'CEO & Founder', avatar: 'AF' },
    { name: 'Siti Nurhaliza', role: 'CTO', avatar: 'SN' },
    { name: 'Budi Setiawan', role: 'Head of Security', avatar: 'BS' },
    { name: 'Dewi Lestari', role: 'Product Manager', avatar: 'DL' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-600 mb-6">
              About <span className="text-primary-600">DCPermit</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are dedicated to providing secure, efficient, and compliant data center access management solutions.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary-600 font-semibold mb-4 block">Our Mission</span>
                <h2 className="text-3xl font-bold text-dark-600 mb-6">
                  Simplifying Data Center Security
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Our mission is to revolutionize how organizations manage data center access. 
                  We believe security should be seamless, not burdensome.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  With our comprehensive working permit system, we help businesses maintain 
                  the highest security standards while providing an exceptional user experience.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { number: '500+', label: 'Permits Processed' },
                  { number: '50+', label: 'Partner Companies' },
                  { number: '99.9%', label: 'Uptime' },
                  { number: '24/7', label: 'Support' },
                ].map((stat, index) => (
                  <Card key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                    <div className="text-gray-500 text-sm">{stat.label}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-dark-600 mb-4">Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Meet the people behind DCPermit who work tirelessly to keep your data center secure.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} hover className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-dark-600">{member.name}</h3>
                  <p className="text-gray-500 text-sm">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
