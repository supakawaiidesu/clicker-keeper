import { Router } from 'express';
import { http, createWalletClient, parseAbi, Address, Chain, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createNonceManager, jsonRpc } from 'viem/nonce';

const router = Router();

const customChain: Chain = {
  id: 360,
  name: 'Caldera Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Caldera',
    symbol: 'CAL',
  },
  rpcUrls: {
    default: {
      http: ['https://molten.calderachain.xyz/http'],
    },
    public: {
      http: ['https://molten.calderachain.xyz/http'],
    },
  },
};

const RPC_URL = process.env.RPC_URL || 'https://molten.calderachain.xyz/http';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Function to ensure the private key is properly formatted
function formatPrivateKey(key: string): Hex {
    if (key.startsWith('0x')) {
      return key as Hex;
    }
    return `0x${key}` as Hex;
  }
  
  const nonceManager = createNonceManager({
    source: jsonRpc(),
  });
  
  // Ensure the private key is properly formatted before creating the account
  const formattedPrivateKey = formatPrivateKey(PRIVATE_KEY);
  const account = privateKeyToAccount(formattedPrivateKey, { nonceManager });
  
  const walletClient = createWalletClient({
    account,
    chain: customChain,
    transport: http(RPC_URL)
  });
  
  const contractABI = parseAbi([
    'function tick(address user) external',
  ]);
  
  router.post('/', async (req, res) => {
    const { userAddress } = req.body;
  
    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({ error: 'Valid user address is required' });
    }
  
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'tick',
        args: [userAddress as Address],
      });
  
      res.json({ success: true, transactionHash: hash });
    } catch (error) {
      console.error('Error calling tick function:', error);
      res.status(500).json({ error: 'Failed to process tick' });
    }
  });
  
  export default router;