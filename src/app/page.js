"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { createPublicClient, custom, encodeFunctionData, parseUnits } from "viem";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CONTRACTS = {
  base: "0x66aC3D0cF653314F6ab797906d287d8F4D2a6667",
  electroneum: "0x37B8c98c10bBABfCE2c00F52aB09623c710D6FE2",
};

const NETWORKS = {
  base: {
    id: 8453,
    symbol: "ETH",
    name: "Base",
  },
  electroneum: {
    id: 52014,
    symbol: "ETN",
    name: "Electroneum",
  },
};

const BATCH_SIZE = 500;

export default function Home() {
  const account = useAccount();
  const address = account.address;
  const isConnected = account.isConnected;
  const { connect, disconnect } = useConnect();
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [csvData, setCsvData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [whitelistFee, setWhitelistFee] = useState(0);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [whitelistExpiration, setWhitelistExpiration] = useState(0);
  const [whitelistDuration, setWhitelistDuration] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isConnected) {
      determineContractAddress();
      fetchOwner();
      updateWhitelistData();
    }
  }, [isConnected, address, account.chain?.id]);

  

  useEffect(() => {
    updateWhitelistData();
  }, [whitelistExpiration,whitelistDuration, whitelistFee]);


  const updateWhitelistData = async () => {
    setIsWhitelisted(null);
    setWhitelistFee(null);
    setWhitelistDuration(null);
  
    try {
      await Promise.all([
        fetchWhitelistStatus(),
        fetchWhitelistFee(),
        fetchWhitelistDuration(),
      ]);
      
    } catch (error) {
      console.error("❌ Error updating whitelist data:", error);
    }
  };
  

  const determineContractAddress = () => {
    const chainId = account.chain?.id;
    let selectedContract = "";

    if (chainId === NETWORKS.base.id) {
      selectedContract = CONTRACTS.base; // Base mainnet
    } else if (chainId === NETWORKS.electroneum.id) {
      selectedContract = CONTRACTS.electroneum; // Electroneum mainnet
    }

    setContractAddress(selectedContract);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleCSVUpload(acceptedFiles[0]),
    accept: ".csv",
    onDropRejected: () => alert("Only CSV files are accepted."),
  });

  const fetchWhitelistFee = async () => {
    if (!window.ethereum) return;
  
    try {
      const client = createPublicClient({
        chain: account.chain.id,
        transport: custom(window.ethereum),
      });
  
      const fee = await client.readContract({
        address: contractAddress,
        abi: [
          {
            name: "whitelistFee",
            type: "function",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        functionName: "whitelistFee",
      });
  
      if (fee) setWhitelistFee(parseFloat(fee) / 1e18);
    } catch (error) {
      console.error("Error fetching whitelist fee:", error);
    }
  };
  
  const fetchWhitelistDuration = async () => {
    if (!window.ethereum) return;
  
    try {
      const client = createPublicClient({
        chain: account.chain.id,
        transport: custom(window.ethereum),
      });
  
      const duration = await client.readContract({
        address: contractAddress,
        abi: [
          {
            name: "whitelistDuration",
            type: "function",
            inputs: [],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        functionName: "whitelistDuration",
      });
  
      if (duration) setWhitelistDuration(parseInt(duration) / (24 * 60 * 60)); // Convertir segundos a días
    } catch (error) {
      console.error("Error fetching whitelist duration:", error);
    }
  };
  
  const fetchWhitelistStatus = async () => {
    if (!window.ethereum) return;
  
    try {
      const client = createPublicClient({
        chain: account.chain.id,
        transport: custom(window.ethereum),
      });
  
      const expiration = await client.readContract({
        address: contractAddress,
        abi: [
          {
            name: "whitelist",
            type: "function",
            inputs: [{ name: "user", type: "address" }],
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
          },
        ],
        functionName: "whitelist",
        args: [address],
      });
  
      if (expiration) {
        const currentTime = Math.floor(Date.now() / 1000);
        setWhitelistExpiration(parseInt(expiration));
        setIsWhitelisted(currentTime < expiration);
      }
    } catch (error) {
      console.error("Error fetching whitelist status:", error);
    }
  };

  const fetchOwner = async () => {
    if (!window.ethereum) return;

    try {
      const client = createPublicClient({
        chain: account.chain.id,
        transport: custom(window.ethereum),
      });

      const contractOwner = await client.readContract({
        address: contractAddress,
        abi: [
          {
            name: "owner",
            type: "function",
            inputs: [],
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
          },
        ],
        functionName: "owner",
      });

      setIsOwner(contractOwner.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error fetching contract owner:", error);
    }
  };

  const handleCSVUpload = (file) => {
    setFileName(file.name);

    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
      },
      header: false,
    });
  };

  const handleOpenHelp = () => {
    setIsHelpVisible(true);
  };

  const handleCloseHelp = () => {
    setIsHelpVisible(false);
  };

  const calculateRemainingDays = () => {
    if (!whitelistExpiration) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = whitelistExpiration - currentTime;

    return remainingTime > 0 ? Math.ceil(remainingTime / (24 * 60 * 60)) : 0;
  };

  const remainingDays = calculateRemainingDays();

  if (!isClient) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        {!isConnected ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <p className="mb-4">Connect the wallet that has the tokens for the airdrop</p>
            <ConnectButton className="mx-auto" />
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-center items-center">
              <p className="text-center mb-4 text-lg">Connected as: {address}</p>
              {!isOwner && (
                <p className="text-blue-400 mb-4">
                  {isWhitelisted
                    ? `You are whitelisted. Days remaining: ${remainingDays !== null ? remainingDays : "..."}.`
                    : `You are not whitelisted. The whitelist subscription lasts for ${
                        whitelistDuration !== null ? whitelistDuration : "..."
                      } days and costs ${
                        whitelistFee !== null ? whitelistFee : "..."
                      } ${account.chain?.id === NETWORKS.base.id ? NETWORKS.base.symbol : NETWORKS.electroneum.symbol}.`}
                </p>
              )}
            </div>
            <div className="flex justify-center items-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md mb-4"
                onClick={handleOpenHelp}
              >
                Help
              </button>
              {isHelpVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg text-gray-800 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-center">Help</h2>
                    <p className="mb-2 text-lg">
                      1. Fill token CA, amount of tokens per address, and upload a CSV file with 1 wallet per line.
                    </p>
                    <p className="mb-2 text-lg">
                      2. Press &quot;Send tokens&quot;.
                    </p>
                    <p className="mb-2 text-lg">
                      3. Approve all the tokens when needed (total amount will be input amount * wallets in the CSV).
                    </p>
                    <p className="mb-2 text-lg">
                      4. Approve each bundled transaction of 500 wallets (check and adjust estimated gas fees before proceeding, usually it takes around $0.40 at average rates).
                    </p>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full"
                      onClick={handleCloseHelp}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Token Address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Amount to Send"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div {...getRootProps()} className="dropzone w-full border-2 border-gray-600 border-dashed rounded-lg p-6 text-center bg-gray-700 hover:bg-gray-600">
                <input {...getInputProps()} />
                <p className="text-gray-400">{fileName ? `File loaded: ${fileName}` : "Drag & Drop your CSV here, or click to select a file"}</p>
              </div>

              <div className="space-x-4 flex justify-center mt-4">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
                >
                  Send Tokens
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
