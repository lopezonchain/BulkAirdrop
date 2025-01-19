import { base, baseSepolia } from '@wagmi/core/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { metaMask, walletConnect } from '@wagmi/connectors';

const config = getDefaultConfig({
  appName: 'McFarmers',
  projectId: '91e4298f4ed8aa463e3565e8116a943f',
  chains: [base],
  transports: {
    [base.id]: http('https://rpc.ankr.com/base/9d117ee12554d5ad962f7c4be7e1aa2bf4c6376edb9f7d441934c9adaa82179a'),
  },
});

export { config };
