const hre = require("hardhat");

async function main() {
  console.log("\n========================================");
  console.log(" Freelance Payment Escrow - Deployment");
  console.log("========================================\n");

  // --------------------------------------------------
  // 1. GET DEPLOYER ACCOUNT
  // --------------------------------------------------

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer address:");
  console.log(deployer.address);

  // --------------------------------------------------
  // 2. GET DEPLOYER BALANCE
  // --------------------------------------------------

  const balance = await hre.ethers.provider.getBalance(
    deployer.address
  );

  let formattedBalance;

  // Compatible with ethers v6 and ethers v5
  if (typeof hre.ethers.formatEther === "function") {
    formattedBalance = hre.ethers.formatEther(balance);
  } else if (
    hre.ethers.utils &&
    typeof hre.ethers.utils.formatEther === "function"
  ) {
    formattedBalance = hre.ethers.utils.formatEther(balance);
  } else {
    formattedBalance = balance.toString();
  }

  console.log("\nDeployer balance:");
  console.log(formattedBalance, "ETH");

  // --------------------------------------------------
  // 3. GET CONTRACT FACTORY
  // --------------------------------------------------

  console.log("\nGetting contract factory...");

  const FreelanceEscrow =
    await hre.ethers.getContractFactory("FreelanceEscrow");

  // --------------------------------------------------
  // 4. DEPLOY CONTRACT
  // --------------------------------------------------

  /*
   * IMPORTANT
   * ------------------------------------------------
   * Your FreelanceEscrow constructor requires
   * ONE address argument.
   *
   * We use the deployer's address as the
   * initial owner/admin.
   */

  console.log("\nDeploying contract...\n");

  const escrow = await FreelanceEscrow.deploy(
    deployer.address
  );

  // --------------------------------------------------
  // 5. WAIT FOR DEPLOYMENT
  // --------------------------------------------------

  let contractAddress;

  // Ethers v6
  if (typeof escrow.waitForDeployment === "function") {
    await escrow.waitForDeployment();

    if (typeof escrow.getAddress === "function") {
      contractAddress = await escrow.getAddress();
    } else {
      contractAddress = escrow.target;
    }
  }

  // Ethers v5
  else if (typeof escrow.deployed === "function") {
    await escrow.deployed();
    contractAddress = escrow.address;
  }

  // Safety fallback
  else {
    contractAddress =
      escrow.address ||
      escrow.target;
  }

  // --------------------------------------------------
  // 6. DISPLAY DEPLOYMENT INFORMATION
  // --------------------------------------------------

  console.log("\n========================================");
  console.log(" Deployment Successful");
  console.log("========================================\n");

  console.log("Contract address:");
  console.log(contractAddress);

  console.log("\nDeployer / Owner:");
  console.log(deployer.address);

  console.log("\nNetwork:");
  console.log(hre.network.name);

  // --------------------------------------------------
  // 7. FRONTEND ENV VALUE
  // --------------------------------------------------

  console.log("\n========================================");
  console.log(" FRONTEND .env VALUE");
  console.log("========================================\n");

  console.log(
    `VITE_CONTRACT_ADDRESS=${contractAddress}`
  );

  // --------------------------------------------------
  // 8. FINAL MESSAGE
  // --------------------------------------------------

  console.log("\n========================================");
  console.log(" Deployment completed successfully!");
  console.log("========================================\n");
}


// --------------------------------------------------
// RUN DEPLOYMENT
// --------------------------------------------------

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("\n========================================");
    console.error(" Deployment Failed");
    console.error("========================================\n");

    console.error(error);

    process.exitCode = 1;
  });