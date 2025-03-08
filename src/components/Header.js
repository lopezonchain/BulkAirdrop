import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Web', href: 'https://etn.buddybattles.xyz/' },
    { name: 'Battles', href: 'https://app.buddybattles.xyz/' },
    { name: 'Staking', href: 'https://stake.buddybattles.xyz/' },
    { name: 'NFT', href: 'https://mint.buddybattles.xyz/' },
    { name: 'Airdrop', href: 'https://airdrop.buddybattles.xyz/' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full h-20 z-50 bg-[#3a33aa] text-white shadow-md flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-lg font-bold hidden lg:block">
            Bulk Airdrop
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:underline text-lg font-semibold"
            >
              {link.name}
            </Link>
          ))}
          <ConnectButton />
        </nav>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center">
          <ConnectButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-2 focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden fixed top-20 left-0 w-full bg-[#3a33aa] text-white shadow-md flex flex-col items-center space-y-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="w-full text-center text-xl font-semibold hover:underline"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default Header;
