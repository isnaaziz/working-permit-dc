import React from 'react';

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'IT Manager',
    company: 'PT. Tech Solutions',
    avatar: 'BS',
    rating: 5,
    content: 'The permit system has streamlined our data center visits tremendously. What used to take days now takes hours. Highly recommended!',
  },
  {
    name: 'Siti Rahayu',
    role: 'Network Engineer',
    company: 'Cloud Indonesia',
    avatar: 'SR',
    rating: 5,
    content: 'Sangat mudah digunakan dan prosesnya cepat. QR code verification membuat check-in menjadi sangat praktis.',
  },
  {
    name: 'Ahmad Wijaya',
    role: 'Security Manager',
    company: 'DC Provider',
    avatar: 'AW',
    rating: 5,
    content: 'As a security manager, I appreciate the comprehensive audit trail and real-time tracking features. It has improved our security protocols significantly.',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-dark-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')]"></div>
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto">
            Trusted by leading companies for secure data center access management.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-yellow-400 text-lg">★★★★★</span>
            <span className="text-white font-medium">4.9 / 5.0</span>
            <span className="text-primary-200">average rating</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400"></i>
                ))}
              </div>

              {/* Content */}
              <p className="text-white/90 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-primary-200 text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
