import { base, baseSepolia } from '@wagmi/core/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { metaMask, walletConnect } from '@wagmi/connectors';

const config = getDefaultConfig({
  appName: '',
  projectId: '',
  chains: [base],
  transports: {
    [base.id]: http('https://rpc.ankr.com/base'),
  },
});

export { config };
