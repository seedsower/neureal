import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [base],
  [
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
