import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { base, baseGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    base,
    ...(process.env.NODE_ENV === 'development' ? [baseGoerli] : []),
  ],
  [
    // Add providers in order of preference
    ...(process.env.REACT_APP_ALCHEMY_API_KEY
      ? [alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY })]
      : []),
    ...(process.env.REACT_APP_INFURA_API_KEY
      ? [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_API_KEY })]
      : []),
    publicProvider(),
  ]
);

// Configure wallets
const { connectors } = getDefaultWallets({
  appName: 'Neureal',
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'neureal-prediction-market',
  chains,
});

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };
