import React from 'react';

const steps = [
  {
    number: '01',
    icon: 'ri-file-add-line',
    title: 'Submit Request',
    description: 'Fill out the online form and upload required documents for your working permit.',
    color: 'primary',
  },
  {
    number: '02',
    icon: 'ri-check-double-line',
    title: 'Approval Process',
    description: 'Your request goes through PIC review and Manager approval workflow.',
    color: 'secondary',
  },
  {
    number: '03',
    icon: 'ri-qr-scan-2-line',
    title: 'Receive QR Code',
    description: 'Get your unique QR code and OTP via email for check-in verification.',
    color: 'accent',
  },
  {
    number: '04',
    icon: 'ri-door-open-line',
    title: 'Access Data Center',
    description: 'Scan QR, verify identity, receive temp ID card, and access the facility.',
    color: 'success',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-secondary-100 text-secondary-600 rounded-full text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark-600 mb-4">
            How It <span className="text-primary-600">Works</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Getting access to the data center is simple and secure with our streamlined process.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-secondary-200 to-success-100 transform -translate-y-1/2"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-${step.color}-100 flex items-center justify-center mb-4`}>
                    <i className={`${step.icon} text-3xl text-${step.color}-600`}></i>
                  </div>

                  <h3 className="text-xl font-bold text-dark-600 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile/tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <i className="ri-arrow-down-line text-2xl text-gray-300"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
