import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
} from "./contract";

function App() {
  // ==============================
  // WALLET STATE
  // ==============================

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");

  // ==============================
  // PROJECT STATE
  // ==============================

  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectId, setProjectId] = useState("");

  const [project, setProject] = useState(null);
  const [contractBalance, setContractBalance] = useState("0");

  // ==============================
  // MESSAGE STATE
  // ==============================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // CONNECT WALLET
  // ==============================

  const connectWallet = async () => {
    try {
      setError("");
      setMessage("");

      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const browserProvider =
        new ethers.BrowserProvider(window.ethereum);

      await browserProvider.send("eth_requestAccounts", []);

      const walletSigner =
        await browserProvider.getSigner();

      const address =
        await walletSigner.getAddress();

      const networkData =
        await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setAccount(address);

      setNetwork(
        `Chain ID: ${networkData.chainId.toString()}`
      );

      setMessage("Wallet connected successfully.");

      // Load contract balance after connecting
      await loadContractBalance(browserProvider);

    } catch (err) {
      console.error(err);

      setError(
        err?.shortMessage ||
        err?.message ||
        "Wallet connection failed."
      );
    }
  };

  // ==============================
  // DISCONNECT WALLET
  // ==============================

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount("");
    setNetwork("");
    setProject(null);

    setMessage("Wallet disconnected.");
    setError("");
  };

  // ==============================
  // HANDLE METAMASK ACCOUNT CHANGE
  // ==============================

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
        return;
      }

      try {
        const browserProvider =
          new ethers.BrowserProvider(window.ethereum);

        const walletSigner =
          await browserProvider.getSigner();

        const address =
          await walletSigner.getAddress();

        const networkData =
          await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(walletSigner);
        setAccount(address);

        setNetwork(
          `Chain ID: ${networkData.chainId.toString()}`
        );

        setMessage(
          "Wallet account changed successfully."
        );

        await loadContractBalance(browserProvider);

      } catch (err) {
        console.error(err);
        setError(
          err?.message ||
          "Failed to update wallet account."
        );
      }
    };

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  // ==============================
  // HANDLE NETWORK CHANGE
  // ==============================

  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on(
      "chainChanged",
      handleChainChanged
    );

    return () => {
      window.ethereum.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  // ==============================
  // LOAD CONTRACT BALANCE
  // ==============================

  const loadContractBalance = async (
    currentProvider = provider
  ) => {
    try {
      if (!currentProvider) return;

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        currentProvider
      );

      const balance =
        await contract.getContractBalance();

      setContractBalance(
        ethers.formatEther(balance)
      );

    } catch (err) {
      console.error(
        "Contract balance error:",
        err
      );
    }
  };

  // ==============================
  // CREATE ESCROW
  // ==============================

  const createEscrow = async () => {
    try {
      setMessage("");
      setError("");

      if (!signer) {
        setError(
          "Please connect your wallet first."
        );
        return;
      }

      if (!freelancerAddress) {
        setError(
          "Please enter freelancer wallet address."
        );
        return;
      }

      if (!ethers.isAddress(freelancerAddress)) {
        setError(
          "Invalid freelancer wallet address."
        );
        return;
      }

      if (!projectTitle.trim()) {
        setError(
          "Please enter project title."
        );
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setMessage(
        "Creating escrow..."
      );

      const tx = await contract.createEscrow(
        freelancerAddress,
        projectTitle
      );

      await tx.wait();

      setMessage(
        "Escrow created successfully."
      );

      setError("");

      await loadContractBalance();

    } catch (err) {
      console.error(
        "CREATE ESCROW ERROR:",
        err
      );

      setError(
        err?.reason ||
        err?.shortMessage ||
        err?.info?.error?.message ||
        err?.message ||
        "Create escrow transaction failed."
      );
    }
  };

  // ==============================
  // FUND ESCROW
  // ==============================

  const fundEscrow = async () => {
    try {
      setMessage("");
      setError("");

      if (!signer) {
        setError(
          "Please connect your wallet first."
        );
        return;
      }

      if (!projectId) {
        setError(
          "Please enter a project ID."
        );
        return;
      }

      if (!project) {
        setError(
          "Please load the project first."
        );
        return;
      }

      const amount =
        ethers.formatEther(project.amount);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setMessage(
        `Funding escrow with ${amount} ETH...`
      );

      const tx = await contract.fundEscrow(
        projectId,
        {
          value: project.amount,
        }
      );

      await tx.wait();

      setMessage(
        "Escrow funded successfully."
      );

      await loadProject();
      await loadContractBalance();

    } catch (err) {
      console.error(
        "FUND ESCROW ERROR:",
        err
      );

      setError(
        err?.reason ||
        err?.shortMessage ||
        err?.info?.error?.message ||
        err?.message ||
        "Fund escrow transaction failed."
      );
    }
  };

  // ==============================
  // LOAD PROJECT
  // ==============================

  const loadProject = async () => {
    try {
      setMessage("");
      setError("");

      if (!provider) {
        setError(
          "Please connect your wallet first."
        );
        return;
      }

      if (!projectId) {
        setError(
          "Please enter a project ID."
        );
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const details =
        await contract.getEscrowDetails(
          projectId
        );

      const loadedProject = {
        id: details[0].toString(),
        client: details[1],
        freelancer: details[2],
        amount: details[3],
        status: Number(details[4]),
        createdAt: details[5].toString(),
        title: details[6],
      };

      setProject(loadedProject);

      setMessage(
        "Project loaded successfully."
      );

    } catch (err) {
      console.error(
        "LOAD PROJECT ERROR:",
        err
      );

      setProject(null);

      setError(
        err?.reason ||
        err?.shortMessage ||
        err?.info?.error?.message ||
        err?.message ||
        "Unable to load project."
      );
    }
  };

  // ==============================
  // START WORK
  // ==============================

  const startWork = async () => {
    try {
      setMessage("");
      setError("");

      if (!signer) {
        setError(
          "Please connect your wallet first."
        );
        return;
      }

      if (!projectId) {
        setError(
          "Please enter a project ID."
        );
        return;
      }

      if (!project) {
        setError(
          "Please load the project first."
        );
        return;
      }

      // Check connected wallet against freelancer
      const connectedAddress =
        await signer.getAddress();

      if (
        connectedAddress.toLowerCase() !==
        project.freelancer.toLowerCase()
      ) {
        setError(
          "Only the assigned freelancer can start work."
        );
        return;
      }

      // Status should be FUNDED
      if (project.status !== 1) {
        setError(
          `Start Work is not available. Current status: ${getStatusName(
            project.status
          )}`
        );
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setMessage(
        "Starting work..."
      );

      const tx =
        await contract.startWork(projectId);

      await tx.wait();

      setMessage(
        "Work started successfully."
      );

      await loadProject();

    } catch (err) {
      console.error(
        "START WORK ERROR:",
        err
      );

      setError(
        err?.reason ||
        err?.shortMessage ||
        err?.info?.error?.message ||
        err?.message ||
        "Start Work transaction failed."
      );
    }
  };

  // ==============================
  // SUBMIT WORK
  // ==============================

  const submitWork = async () => {
    try {
      setMessage("");
      setError("");

      if (!signer) {
        setError(
          "Please connect your wallet first."
        );
        return;
      }

      if (!projectId) {
        setError(
          "Please enter a project ID."
        );
        return;
      }

      if (!project) {
        setError(
          "Please load the project first."
        );
        return;
      }

      const connectedAddress =
        await signer.getAddress();

      if (
        connectedAddress.toLowerCase() !==
        project.freelancer.toLowerCase()
      ) {
        setError(
          "Only the assigned freelancer can submit work."
        );
        return;
      }

      if (project.status !== 2) {
        setError(
          `Submit Work is not available. Current status: ${getStatusName(
            project.status
          )}`
        );
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setMessage(
        "Submitting work..."
      );

      const tx =
        await contract.submitWork(projectId);

      await tx.wait();

      setMessage(
        "Work submitted successfully."
      );

      await loadProject();

    } catch (err) {
      console.error(
        "SUBMIT WORK ERROR:",
        err
      );

      setError(
        err?.reason ||
        err?.shortMessage ||
        err?.info?.error?.message ||
        err?.message ||
        "Submit Work transaction failed."
      );
    }
  };

  // ==============================
  // APPROVE AND RELEASE PAYMENT
  // ==============================

  const approveAndReleasePayment =
    async () => {
      try {
        setMessage("");
        setError("");

        if (!signer) {
          setError(
            "Please connect your wallet first."
          );
          return;
        }

        if (!projectId) {
          setError(
            "Please enter a project ID."
          );
          return;
        }

        if (!project) {
          setError(
            "Please load the project first."
          );
          return;
        }

        const connectedAddress =
          await signer.getAddress();

        if (
          connectedAddress.toLowerCase() !==
          project.client.toLowerCase()
        ) {
          setError(
            "Only the client can approve and release payment."
          );
          return;
        }

        if (project.status !== 3) {
          setError(
            `Payment release is not available. Current status: ${getStatusName(
              project.status
            )}`
          );
          return;
        }

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        setMessage(
          "Releasing payment..."
        );

        const tx =
          await contract.approveAndReleasePayment(
            projectId
          );

        await tx.wait();

        setMessage(
          "Payment released successfully."
        );

        await loadProject();
        await loadContractBalance();

      } catch (err) {
        console.error(
          "APPROVE PAYMENT ERROR:",
          err
        );

        setError(
          err?.reason ||
          err?.shortMessage ||
          err?.info?.error?.message ||
          err?.message ||
          "Payment release failed."
        );
      }
    };

  // ==============================
  // STATUS NAME
  // ==============================

  const getStatusName = (status) => {
    const statuses = [
      "CREATED",
      "FUNDED",
      "IN_PROGRESS",
      "SUBMITTED",
      "COMPLETED",
      "CANCELLED",
      "DISPUTED",
    ];

    return statuses[status] || "UNKNOWN";
  };

  // ==============================
  // INITIAL CONTRACT BALANCE
  // ==============================

  useEffect(() => {
    if (provider) {
      loadContractBalance(provider);
    }
  }, [provider]);

  // ==============================
  // UI
  // ==============================

  return (
    <div className="app">

      {/* HEADER */}

      <div className="header">

        <div>
          <h1>
            Freelance Payment Escrow
          </h1>

          <p>
            Blockchain-based freelance payment system
          </p>
        </div>

        <div>

          {!account ? (
            <button
              className="connect-button"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              className="disconnect-button"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
          )}

        </div>

      </div>

      {/* WALLET INFORMATION */}

      <div className="card">

        <h2>
          1. Wallet Connection
        </h2>

        {!account ? (
          <p className="description">
            Connect MetaMask to interact with
            the escrow contract.
          </p>
        ) : (
          <>
            <div className="info-grid">

              <div className="info-box">
                <span>
                  Wallet
                </span>

                <strong>
                  {account.slice(0, 6)}
                  ...
                  {account.slice(-4)}
                </strong>
              </div>

              <div className="info-box">
                <span>
                  Network
                </span>

                <strong>
                  Hardhat Local
                </strong>
              </div>

              <div className="info-box">
                <span>
                  Chain
                </span>

                <strong>
                  {network}
                </strong>
              </div>

              <div className="info-box">
                <span>
                  Contract Balance
                </span>

                <strong>
                  {contractBalance} ETH
                </strong>
              </div>

            </div>

            <div className="wallet-full">
              <strong>
                Connected Wallet:
              </strong>

              <br />

              {account}
            </div>
          </>
        )}

      </div>

      {/* MESSAGES */}

      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* CREATE ESCROW */}

      <div className="card">

        <h2>
          2. Create Escrow
        </h2>

        <p className="description">
          Client creates a freelance escrow
          project by specifying the freelancer.
        </p>

        <label>
          Freelancer Wallet Address
        </label>

        <input
          type="text"
          placeholder="0x..."
          value={freelancerAddress}
          onChange={(e) =>
            setFreelancerAddress(
              e.target.value
            )
          }
        />

        <label>
          Project Title
        </label>

        <input
          type="text"
          placeholder="Blockchain Website Development"
          value={projectTitle}
          onChange={(e) =>
            setProjectTitle(
              e.target.value
            )
          }
        />

        <button
          onClick={createEscrow}
        >
          Create Escrow
        </button>

      </div>

      {/* MANAGE PROJECT */}

      <div className="card">

        <h2>
          3. Manage Project
        </h2>

        <label>
          Project ID
        </label>

        <div className="row">

          <input
            type="number"
            placeholder="1"
            value={projectId}
            onChange={(e) =>
              setProjectId(
                e.target.value
              )
            }
          />

          <button
            onClick={loadProject}
          >
            Load Project
          </button>

        </div>

        {project && (
          <div className="project-details">

            <h3>
              Project Details
            </h3>

            <p>
              <strong>
                ID:
              </strong>{" "}
              {project.id}
            </p>

            <p>
              <strong>
                Title:
              </strong>{" "}
              {project.title}
            </p>

            <p>
              <strong>
                Client:
              </strong>{" "}
              {project.client}
            </p>

            <p>
              <strong>
                Freelancer:
              </strong>{" "}
              {project.freelancer}
            </p>

            <p>
              <strong>
                Amount:
              </strong>{" "}
              {ethers.formatEther(
                project.amount
              )}{" "}
              ETH
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}

              <span className="status">
                {getStatusName(
                  project.status
                )}
              </span>
            </p>

          </div>
        )}

        {/* WORKFLOW */}

        <div className="workflow">

          <h3>
            Escrow Workflow
          </h3>

          <button
            onClick={fundEscrow}
          >
            Fund Escrow
          </button>

          <button
            onClick={startWork}
          >
            Start Work
          </button>

          <button
            onClick={submitWork}
          >
            Submit Work
          </button>

          <button
            onClick={
              approveAndReleasePayment
            }
          >
            Approve & Release Payment
          </button>

        </div>

      </div>

      {/* WORKFLOW STATUS */}

      <div className="card">

        <h2>
          4. Escrow Process
        </h2>

        <div className="status-list">

          <div>
            1. Create Escrow
          </div>

          <div>
            2. Fund Escrow
          </div>

          <div>
            3. Start Work
          </div>

          <div>
            4. Submit Work
          </div>

          <div>
            5. Approve & Release Payment
          </div>

          <div>
            6. Completed
          </div>

        </div>

      </div>

    </div>
  );
}

export default App;