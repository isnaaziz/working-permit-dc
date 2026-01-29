import React, { useState } from 'react';
import { Navbar, Footer } from '../../components/landing';
import { Button, Input, Card } from '../../components/ui';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    alert('Message sent! We will get back to you soon.');
  };

  const contactInfo = [
    { icon: 'ri-map-pin-line', title: 'Address', content: 'Jl. Data Center No. 123, Jakarta, Indonesia' },
    { icon: 'ri-phone-line', title: 'Phone', content: '+62 21 1234 5678' },
    { icon: 'ri-mail-line', title: 'Email', content: 'support@dcpermit.com' },
    { icon: 'ri-time-line', title: 'Working Hours', content: 'Mon - Fri: 09:00 - 18:00' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-600 mb-6">
              Contact <span className="text-primary-600">Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-dark-600 mb-6">Get in Touch</h2>
                {contactInfo.map((item, index) => (
                  <Card key={index} padding="sm" className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-primary-600 text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark-600">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.content}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <h2 className="text-2xl font-bold text-dark-600 mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Your Name"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <Input
                      label="Subject"
                      name="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-2">Message</label>
                      <textarea
                        name="message"
                        rows="5"
                        placeholder="Your message..."
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      ></textarea>
                    </div>
                    <Button type="submit" icon={<i className="ri-send-plane-line"></i>} iconPosition="right">
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
