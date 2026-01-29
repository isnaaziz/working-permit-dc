import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Features', path: '/features' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'Security', path: '/security' },
      { name: 'Integrations', path: '/integrations' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
      { name: 'Press', path: '/press' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Documentation', path: '/docs' },
      { name: 'API Reference', path: '/api' },
      { name: 'Contact', path: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: 'ri-twitter-x-line', url: '#' },
    { icon: 'ri-linkedin-fill', url: '#' },
    { icon: 'ri-github-fill', url: '#' },
    { icon: 'ri-instagram-line', url: '#' },
  ];

  return (
    <footer className="bg-dark-600 text-white">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <i className="ri-server-line text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold">
                DC<span className="text-primary-400">Permit</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-xs">
              Secure and efficient data center access management system for modern enterprises.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-dark-500 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} DCPermit. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Made with <span className="text-red-500">❤</span> for Data Center Security
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
