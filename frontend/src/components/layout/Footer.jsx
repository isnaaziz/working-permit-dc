import React from 'react';

const Footer = () => {
    return (
        <footer className="mt-8 pt-6 border-t border-divider text-center text-xs text-text-muted">
            <p>&copy; {new Date().getFullYear()} DC Access Control System. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
