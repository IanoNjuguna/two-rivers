import { useAccount as useWagmiAccount, useChainId } from "wagmi";
import { useAccount as useAlchemyAccount } from "@account-kit/react";
import sdk from '@farcaster/miniapp-sdk';
import { useState, useEffect } from "react";

/**
 * Custom hook to interact with smart account features
 * Provides access to account address, chain info, and connection status
 */
export function useSmartAccount() {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const wagmiAccount = useWagmiAccount();
  const chainId = useChainId();

  useEffect(() => {
    sdk.isInMiniApp().then(setIsMiniApp).catch(() => setIsMiniApp(false));
  }, []);

  // Because hooks can't be called conditionally, we have to call Alchemy's hook
  // But we know it throws if the context is missing (like in Mini App).
  // A cleaner approach here is to just rely entirely on Wagmi since the AlchemyProvider 
  // also syncs the Smart Account address to Wagmi's useAccount state.

  return {
    address: wagmiAccount.address,
    isConnected: !!wagmiAccount.address,
    chainId: chainId,
    chainName: chainId === 8453 ? 'Base' : 'Arbitrum',
    // Smart account specific features
    isSmartAccount: !isMiniApp,
  };
}

/**
 * Hook to check if gas is sponsored for the current session
 */
export function useGasSponsorship() {
  const { address } = useSmartAccount();

  return {
    isSponsored: !!process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID,
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID,
    canSponsor: !!address && !!process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID,
  };
}
