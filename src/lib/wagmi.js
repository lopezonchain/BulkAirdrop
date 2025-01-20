import { base, baseSepolia } from '@wagmi/core/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { metaMask, walletConnect } from '@wagmi/connectors';

const config = getDefaultConfig({
  appName: 'Example',
  projectId: '91e4298f4ed8aa463e1565e2116a943f',
  chains: [base],
  transports: {
    [base.id]: http('https://rpc.ankr.com/base'),
  },
});

export { config };
