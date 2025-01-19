"use client";

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { createPublicClient, custom, encodeFunctionData, parseUnits } from 'viem';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

// Dirección de tu contrato
const ContractAddress = "0x2c7d837a83356B5B9CACbf2Fb5FaC0F434B787Eb"; 

// Tamaño del lote
const BATCH_SIZE = 500;

export default function Home() {
  const account = useAccount(); // Obtener la cuenta conectada
  const address = account.address;
  const isConnected = account.isConnected;

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [csvData, setCsvData] = useState(null);
  const [fileName, setFileName] = useState(""); // Nombre del archivo cargado
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log("isConnected:", isConnected);
    if (address) {
      console.log("Wallet connected: ", address);
    }
  }, [address, isConnected]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleCSVUpload(acceptedFiles[0]),
    accept: '.csv',
    onDropRejected: () => alert("Only CSV files are accepted.")
  });

  const handleCSVUpload = (file) => {
    if (file.type !== 'text/csv') {
      alert('Please upload a valid CSV file.');
      return;
    }

    setFileName(file.name); // Guardar el nombre del archivo

    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
      },
      header: false,
    });
  };

  const waitForTransactionConfirmation = async (txHash) => {
    let receipt = null;

    while (receipt === null) {
      receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      // Si el recibo es null, esperar 2 segundos y volver a intentarlo
      if (receipt === null) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return receipt;
  };

  const handleSendTokens = async () => {
    if (!csvData || !tokenAddress || !amount || !isConnected) return;
  
    const recipients = csvData.map(row => row[0]);
  
    // Dividir los destinatarios en lotes de tamaño BATCH_SIZE
    const recipientBatches = [];
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      recipientBatches.push(recipients.slice(i, i + BATCH_SIZE));
    }
  
    try {
      // Verificar si existe `window.ethereum`
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }
  
      // Obtener la cuenta de MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const senderAddress = accounts[0];
  
      // Crear el cliente de Viem con el proveedor de la cuenta conectada (MetaMask)
      const client = createPublicClient({
        chain: account.chain.id, // Usamos la red de la cuenta conectada
        transport: custom(window.ethereum), // Usamos el transporte para MetaMask
      });
  
      // Calcular el monto total para la aprobación (solo se hace una vez)
      const totalAmount = parseUnits((amount * recipients.length).toString(), 18);
  
      // Codificar los datos para la transacción de aprobación (solo se hace una vez)
      const approveData = encodeFunctionData({
        abi: [
          {
            "name": "approve",
            "type": "function",
            "inputs": [
              { "name": "spender", "type": "address" },
              { "name": "amount", "type": "uint256" }
            ]
          }
        ],
        functionName: "approve",
        args: [ContractAddress, totalAmount]
      });
  
      // Preparar la transacción de aprobación
      const approveTx = {
        to: tokenAddress,
        from: senderAddress,
        data: approveData,
        value: 0n,
      };
  
      // Enviar la transacción de aprobación
      const approveTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [approveTx],
      });
  
      console.log("Approval transaction sent: ", approveTxHash);
  
      // Esperar la confirmación de la transacción de aprobación
      const approveReceipt = await waitForTransactionConfirmation(approveTxHash);
      if (approveReceipt.status !== '0x1') {
        throw new Error('Approval transaction failed');
      }
  
      console.log("Approval transaction confirmed");
  
      // Enviar los tokens en los lotes
      for (let i = 0; i < recipientBatches.length; i++) {
        const batch = recipientBatches[i];
  
        // Codificar los datos para la transacción de envío de tokens (utiliza la misma cantidad para todos los destinatarios)
        const sendData = encodeFunctionData({
          abi: [
            {
              "name": "sendBatchFunds",
              "type": "function",
              "inputs": [
                { "name": "tokenAddress", "type": "address" },
                { "name": "recipients", "type": "address[]" },
                { "name": "amount", "type": "uint256" }
              ]
            }
          ],
          functionName: "sendBatchFunds",
          args: [tokenAddress, batch, parseUnits(amount, 18)] // Utiliza la misma cantidad para todos
        });
  
        // Preparar la transacción de envío de tokens
        const sendTx = {
          to: ContractAddress,
          from: senderAddress,
          data: sendData,
          value: 0n,
        };
  
        // Enviar la transacción de envío de tokens
        const sendTxHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [sendTx],
        });
  
        console.log("Batch tokens sent (batch " + (i + 1) + "): ", sendTxHash);
      }
  
      alert("Tokens successfully sent!");
    } catch (err) {
      console.error("Error sending tokens:", err);
      alert(`Error: ${err.message}`);
    }
  };
  

  if (!isClient) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        {!isConnected ? (
          <div className="text-center">
            <p className="mb-4">Please connect your wallet.</p>
            <button
              onClick={() => connect(connectors[0])}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <p className="text-center mb-4 text-lg">Connected as: {address}</p>

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
                <p className="text-gray-400">{fileName ? `File loaded: ${fileName}` : 'Drag & Drop your CSV here, or click to select a file'}</p>
              </div>

              <div className="space-x-4 flex justify-center mt-4">
                <button
                  onClick={handleSendTokens}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
                >
                  Send Tokens
                </button>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
