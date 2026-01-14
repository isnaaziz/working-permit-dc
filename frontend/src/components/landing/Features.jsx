import React from 'react';
import { Card } from '../ui/Card';

const features = [
  {
    icon: 'ri-file-list-3-line',
    title: 'Digital Permit Request',
    description: 'Submit your working permit request online with easy-to-use forms and document upload.',
    color: 'primary',
  },
  {
    icon: 'ri-flow-chart',
    title: 'Multi-Level Approval',
    description: 'Automated workflow with PIC review and Manager approval for complete oversight.',
    color: 'secondary',
  },
  {
    icon: 'ri-qr-code-line',
    title: 'QR Code Access',
    description: 'Unique QR codes generated for each approved permit for seamless check-in.',
    color: 'accent',
  },
  {
    icon: 'ri-shield-keyhole-line',
    title: '2-Factor Authentication',
    description: 'Enhanced security with OTP verification via email or SMS.',
    color: 'success',
  },
  {
    icon: 'ri-id-card-line',
    title: 'Temporary ID Cards',
    description: 'RFID-enabled temporary access cards for authorized visitors.',
    color: 'warning',
  },
  {
    icon: 'ri-bar-chart-box-line',
    title: 'Real-time Tracking',
    description: 'Monitor visitor access and activity in real-time with detailed logs.',
    color: 'info',
  },
];

const colorClasses = {
  primary: 'bg-primary-100 text-primary-600',
  secondary: 'bg-secondary-100 text-secondary-600',
  accent: 'bg-accent-100 text-accent-600',
  success: 'bg-success-100 text-success',
  warning: 'bg-warning-100 text-warning',
  info: 'bg-blue-100 text-blue-600',
};

const Features = () => {
  return (
    <section className="py-20 bg-white">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-semibold mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark-600 mb-4">
            Why Data Center Access
            <br />
            Can Be <span className="text-primary-600">Challenging</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our comprehensive system addresses all the common challenges in managing data center access,
            providing a seamless experience for both visitors and administrators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              hover 
              className="group"
            >
              <div className={`w-14 h-14 rounded-xl ${colorClasses[feature.color]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <i className={`${feature.icon} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-dark-600 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
