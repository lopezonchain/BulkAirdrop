import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

const Header = () => {
    return (
        <header className="fixed top-0 w-full h-20 z-50 bg-[#3a33aa] text-white shadow-md flex justify-between items-center px-4">
            <div className="flex items-center space-x-2">
                <Link href="/" className="text-lg font-bold hidden lg:block"> {/* Hide in mobile */}
                    Bulk Airdrop
                </Link>
            </div>

            {/* Navigation for Desktop */}
            <nav className="hidden lg:flex items-center space-x-4">
                <ConnectButton />
            </nav>

            {/* Navigation for Mobile */}
            <div className="lg:hidden">
                <div className="flex items-center space-x-2 mb-2">
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
};

export default Header;
