import React, { useState } from 'react';

const faqs = [
  {
    question: 'How long does the permit approval process take?',
    answer: 'The approval process typically takes 1-3 business days, depending on the complexity of your request and the availability of approvers. Urgent requests can be expedited with proper justification.',
  },
  {
    question: 'What documents do I need to submit?',
    answer: 'You will need to provide a valid government-issued ID, company authorization letter, work order details, and any relevant safety certifications depending on the type of work to be performed.',
  },
  {
    question: 'How does the QR code verification work?',
    answer: 'Once your permit is approved, you will receive a unique QR code via email. At the data center, security personnel will scan your QR code and verify your identity with OTP before granting access.',
  },
  {
    question: 'Can I extend my working permit?',
    answer: 'Yes, you can request an extension before your current permit expires. The extension request goes through a simplified approval process and is usually processed within 24 hours.',
  },
  {
    question: 'What happens if I lose my temporary ID card?',
    answer: 'Report the loss immediately to security personnel. They will deactivate the lost card and issue a replacement after identity verification. There may be a replacement fee involved.',
  },
  {
    question: 'Is there 24/7 access to the data center?',
    answer: 'Access availability depends on your permit type and the specific area of the data center. Standard permits provide access during business hours, while maintenance permits may allow 24/7 access for critical work.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 bg-white">
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent-100 text-accent-600 rounded-full text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-dark-600 mb-4">
            Frequently Asked <span className="text-primary-600">Questions</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our data center working permit system.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-primary-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className={`font-semibold ${openIndex === index ? 'text-primary-600' : 'text-dark-600'}`}>
                  {faq.question}
                </span>
                <span className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === index 
                    ? 'bg-primary-500 text-white rotate-180' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <i className="ri-arrow-down-s-line"></i>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-60' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
