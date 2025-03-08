import { base, baseSepolia } from '@wagmi/core/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

const etn = {
  id: 52014,
  name: 'Electroneum',
  network: 'etn',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2137.png',
  iconBackground: '#fff',
  nativeCurrency: {
    name: 'ETN',
    symbol: 'ETN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/electroneum/'],
    },
    public: {
      http: ['https://rpc.ankr.com/electroneum/'],
    },
  },
  blockExplorers: {
    default: { name: 'ETN Explorer', url: 'https://blockexplorer.electroneum.com' },
  },
};

const config = getDefaultConfig({
  appName: 'Buddy',
  projectId: '91e4298f4ed8aa463e3565e8116a943f',
  chains: [etn],
  transports: {
    [etn.id]: http('https://rpc.ankr.com/electroneum'),
  },
});

export { config };
