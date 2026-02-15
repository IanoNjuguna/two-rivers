import { useAccount, useChain } from "@account-kit/react";

/**
 * Custom hook to interact with smart account features
 * Provides access to account address, chain info, and connection status
 */
export function useSmartAccount() {
  const account = useAccount({ type: "LightAccount" });
  const { chain } = useChain();
  
  return {
    address: account.address,
    isConnected: !!account.address,
    chainId: chain?.id,
    chainName: chain?.name,
    // Smart account specific features
    isSmartAccount: true,
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
