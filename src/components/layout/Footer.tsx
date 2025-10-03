import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  const footerSections = [
    {
      title: 'For Clients',
      links: ['Browse Services', 'How It Works', 'Safety & Trust', 'Support'],
    },
    {
      title: 'For Taskers',
      links: ['Become a Tasker', 'Tasker Resources', 'Earnings', 'Tasker Support'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Press', 'Blog'],
    },
    {
      title: 'Support',
      links: ['Help Center', 'Contact Us', 'Terms of Service', 'Privacy Policy'],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TM</span>
              </div>
              <span className="font-semibold text-lg">TaskMarket</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Ghana's premier task marketplace connecting skilled taskers with clients across Accra and beyond.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Button
                  key={label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <a href={href} aria-label={label}>
                    <Icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 TaskMarket Ghana. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Available in Greater Accra</span>
            <span>•</span>
            <span>Payments via Mobile Money</span>
            <span>•</span>
            <span>24/7 Customer Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}