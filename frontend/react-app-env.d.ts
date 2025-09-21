/// <reference types="react-scripts" />

// Disable strict type checking for problematic modules
declare module 'schema-utils' {
  const validate: any;
  export default validate;
}

declare module 'ajv' {
  const Ajv: any;
  export default Ajv;
}

// Allow any for problematic imports
declare module '@rainbow-me/rainbowkit' {
  export const RainbowKitProvider: any;
  export const getDefaultWallets: any;
  export const darkTheme: any;
  export const connectorsForWallets: any;
}

declare module 'wagmi' {
  export const WagmiConfig: any;
  export const configureChains: any;
  export const createConfig: any;
  export const useAccount: any;
  export const useConnect: any;
  export const useDisconnect: any;
}

declare module 'viem' {
  export const createPublicClient: any;
  export const http: any;
}
