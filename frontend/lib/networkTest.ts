// Network connection test utility
export const testCeloSepoliaConnection = async () => {
  try {
    const response = await fetch('https://forno.celo-sepolia.celo-testnet.org', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (data.result === '0xaa044c') {
      console.log('✅ Celo Sepolia RPC is working correctly');
      return true;
    } else {
      console.error('❌ Unexpected chain ID:', data.result);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to connect to Celo Sepolia RPC:', error);
    return false;
  }
};

// Test MetaMask connection
export const testMetaMaskConnection = async () => {
  if (typeof window.ethereum === 'undefined') {
    console.error('❌ MetaMask not detected');
    return false;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('Current chain ID:', chainId);
    
    if (chainId === '0xaa044c') {
      console.log('✅ Connected to Celo Sepolia');
      return true;
    } else {
      console.log('⚠️ Not connected to Celo Sepolia. Current chain:', chainId);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to get chain ID:', error);
    return false;
  }
};
