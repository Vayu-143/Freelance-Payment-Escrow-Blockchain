# Freelance Payment Escrow Using Blockchain

## 1. Project Overview

The Freelance Payment Escrow Using Blockchain project is a decentralized application designed to provide a secure and transparent payment mechanism between clients and freelancers.

The system uses a Solidity smart contract to hold the client's payment in escrow until the assigned freelancer completes the work and the client approves it. After approval, the payment is released to the freelancer through the smart contract.

The application uses React.js for the frontend, Ethers.js for blockchain interaction, MetaMask for wallet connectivity, and Hardhat Local Network for smart contract development and testing.

## 2. Objectives

The main objectives of this project are:

- Develop a blockchain-based freelance escrow system.
- Securely hold client payments using a smart contract.
- Allow freelancers to start and submit work.
- Allow clients to approve completed work.
- Automatically release payment to the freelancer.
- Provide a simple and user-friendly React frontend.
- Integrate MetaMask for wallet connectivity.
- Demonstrate interaction between a frontend application and a blockchain smart contract.
- Test the complete escrow workflow using separate blockchain accounts.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| Solidity | Smart contract development |
| Hardhat | Blockchain development and local testing |
| React.js | Frontend development |
| JavaScript | Application logic |
| Ethers.js | Blockchain interaction |
| MetaMask | Wallet connection and transaction signing |
| Node.js | Development environment |
| HTML/CSS | Frontend structure and styling |
| GitHub | Source code management |
| Visual Studio Code | Development environment |

## 4. System Architecture

The system consists of the client/freelancer interface, wallet layer, React frontend, blockchain interaction layer, smart contract, and local blockchain network.

    +-------------------------+
    |   Client / Freelancer   |
    +------------+------------+
                 |
                 v
    +-------------------------+
    |        MetaMask         |
    |      Wallet Layer       |
    +------------+------------+
                 |
                 v
    +-------------------------+
    |     React Frontend      |
    +------------+------------+
                 |
                 v
    +-------------------------+
    |        Ethers.js        |
    |  Blockchain Interface   |
    +------------+------------+
                 |
                 v
    +-------------------------+
    |   FreelanceEscrow.sol   |
    |     Smart Contract      |
    +------------+------------+
                 |
                 v
    +-------------------------+
    |    Hardhat Local        |
    |       Blockchain        |
    +-------------------------+

## 5. Main Features

The application provides the following major features:

- Connect Wallet
- Display connected wallet address
- Create Escrow
- Assign freelancer wallet address
- Fund Escrow
- Start Work
- Submit Work
- Approve and Release Payment
- Load Project Details
- Display Project ID
- Display Client Address
- Display Freelancer Address
- Display Escrow Amount
- Display Project Status
- Display Contract Balance
- Support separate client and freelancer accounts

## 6. User Roles

### Client

The client is responsible for creating and managing the escrow project.

The client can:

1. Connect the wallet.
2. Specify the freelancer wallet address.
3. Create the escrow project.
4. Fund the escrow.
5. Review the submitted work.
6. Approve the completed work.
7. Release the payment to the freelancer.

### Freelancer

The freelancer is the wallet address assigned to the project by the client.

The freelancer can:

1. Connect the assigned wallet.
2. View the assigned project.
3. Start the work.
4. Complete the assigned task.
5. Submit the work.
6. Receive payment after client approval.

## 7. Escrow Workflow

The complete escrow workflow is:

    Create Escrow
          |
          v
     Fund Escrow
          |
          v
      Start Work
          |
          v
      Submit Work
          |
          v
    Client Approves
          |
          v
   Payment Released
          |
          v
        Verify

The workflow ensures that the payment remains locked in the smart contract until the required project conditions are satisfied.

## 8. Project Status Flow

The project follows a predefined state transition:

    +---------+
    | CREATED |
    +----+----+
         |
         v
    +---------+
    | FUNDED  |
    +----+----+
         |
         v
    +-------------+
    | IN_PROGRESS |
    +------+------+ 
           |
           v
    +-----------+
    | SUBMITTED |
    +-----+-----+
          |
          v
    +-----------+
    | COMPLETED |
    +-----------+

### CREATED

The client creates a new freelance escrow project and assigns a freelancer.

### FUNDED

The client deposits the agreed payment amount into the smart contract.

### IN_PROGRESS

The assigned freelancer starts working on the project.

### SUBMITTED

The freelancer submits the completed work for client approval.

### COMPLETED

The client approves the submitted work and the smart contract releases the escrow payment to the freelancer.

## 9. Smart Contract

The main smart contract is:

    contracts/
    └── FreelanceEscrow.sol

The contract manages project creation, payment escrow, project status, work submission, and payment release.

### createEscrow()

Creates a new freelance project and assigns a freelancer wallet address.

The function stores important project information such as:

- Project ID
- Client address
- Freelancer address
- Project title
- Escrow amount
- Project status

### fundEscrow()

Allows the client to deposit the agreed amount into the smart contract.

After successful funding, the project status changes to FUNDED.

### startWork()

Allows only the assigned freelancer to start the project.

After the freelancer starts the project, the status changes to IN_PROGRESS.

### submitWork()

Allows the assigned freelancer to submit the completed work.

After submission, the project status changes to SUBMITTED.

### approveAndReleasePayment()

Allows the client to approve the submitted work.

After approval:

1. The escrow amount is transferred to the freelancer.
2. The project is marked as completed.
3. The project status becomes COMPLETED.

### getEscrowDetails()

Retrieves the stored project information from the smart contract.

The returned information can include:

- Project ID
- Project title
- Client address
- Freelancer address
- Escrow amount
- Project status

### getContractBalance()

Returns the amount of cryptocurrency currently held by the escrow contract.

## 10. Wallet and Account Usage

The application was tested using separate blockchain accounts to represent different participants.

    Account 1
        |
        | Client
        v
    Create Escrow
    Fund Escrow
    Approve Payment
        |
        v
    Smart Contract
        ^
        |
        |
    Account 2
        |
        | Freelancer
        v
    Start Work
    Submit Work

Using separate accounts demonstrates role-based interaction between the client and freelancer.

## 11. Frontend

The frontend is developed using React.js.

The frontend provides a simple interface for interacting with the smart contract.

### Wallet Connection

Allows users to connect their MetaMask wallet and view the connected wallet address.

### Create Escrow

The client enters:

- Freelancer wallet address
- Project title

and creates a new escrow project.

### Manage Project

The user enters the Project ID and loads the corresponding project details.

The interface displays:

- Project ID
- Project title
- Client address
- Freelancer address
- Escrow amount
- Current project status

### Escrow Workflow Controls

The interface provides buttons for:

- Fund Escrow
- Start Work
- Submit Work
- Approve & Release Payment

The available action depends on the connected account and current project state.

## 12. MetaMask Integration

MetaMask is used as the wallet interface between the user and the blockchain.

The interaction flow is:

    User
      |
      v
    React Application
      |
      v
    MetaMask
      |
      v
    Transaction Confirmation
      |
      v
    Smart Contract
      |
      v
    Blockchain State Updated

Each blockchain transaction requires confirmation through the connected MetaMask account.

## 13. Development Environment

The project was developed using:

- Visual Studio Code
- Node.js
- Hardhat
- React.js
- MetaMask
- Hardhat Local Network

The Hardhat Local Network was used for development and testing without requiring real cryptocurrency.

## 14. Testing Approach

The application was tested by performing the complete escrow workflow using separate blockchain accounts.

The testing sequence was:

    Client Account
          |
          v
    Create Escrow
          |
          v
    Fund Escrow
          |
          v
    Status = FUNDED
          |
          v
    Freelancer Account
          |
          v
    Start Work
          |
          v
    Status = IN_PROGRESS
          |
          v
    Submit Work
          |
          v
    Status = SUBMITTED
          |
          v
    Client Account
          |
          v
    Approve & Release Payment
          |
          v
    Status = COMPLETED

## 15. Final Result

The complete escrow workflow was successfully demonstrated.

The project progressed through the following states:

    CREATED
       ↓
    FUNDED
       ↓
    IN_PROGRESS
       ↓
    SUBMITTED
       ↓
    COMPLETED

The final state confirms that the client was able to approve the submitted work and release the escrow payment through the smart contract.

## 16. Advantages

- Blockchain-based payment management.
- Transparent escrow workflow.
- Smart contract controlled payments.
- Wallet-based authentication.
- Separate client and freelancer accounts.
- Automated payment release.
- Clear project status tracking.
- Reduced dependence on centralized payment processing.
- Demonstrates practical blockchain and Web3 development.
- Suitable for educational and portfolio purposes.

## 17. Limitations

The current implementation is a prototype intended for development and demonstration.

Limitations include:

- Uses a local Hardhat blockchain for testing.
- Does not provide production-level financial infrastructure.
- Does not include advanced dispute resolution.
- Does not include a production database.
- Does not include decentralized file storage.
- Does not include user profile management.
- Does not include notifications.
- Does not include freelancer ratings and reviews.
- Does not include advanced analytics.

## 18. Future Enhancements

The project can be extended with:

- Public blockchain testnet deployment.
- Production blockchain deployment.
- User registration and profiles.
- Multiple freelance projects.
- Milestone-based payments.
- Advanced dispute-resolution mechanism.
- IPFS-based work submission.
- Transaction history.
- Email or application notifications.
- Freelancer ratings and reviews.
- Client and freelancer dashboards.
- Advanced project analytics.
- Multi-token payment support.
- DAO-based dispute resolution.

## 19. Project Structure

    Freelance-Payment-Escrow-Blockchain/
    │
    ├── contracts/
    │   └── FreelanceEscrow.sol
    │
    ├── scripts/
    │   └── deploy.js
    │
    ├── test/
    │   └── FreelanceEscrow.test.js
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── ...
    │   ├── package.json
    │   └── ...
    │
    ├── docs/
    │   ├── 01-Project-Documentation.md
    │   ├── 02-Testing-and-Results.md
    │   └── 03-Screenshots.md
    │
    ├── hardhat.config.js
    ├── package.json
    ├── .gitignore
    └── README.md

## 20. Conclusion

The Freelance Payment Escrow Using Blockchain project demonstrates how blockchain technology and smart contracts can be applied to freelance payment management.

The system provides a structured workflow where the client creates and funds an escrow, the assigned freelancer starts and submits the work, and the client approves the work before payment is released.

The project demonstrates practical skills in:

- Solidity smart contract development
- Hardhat blockchain development
- React.js frontend development
- Ethers.js blockchain integration
- MetaMask wallet integration
- Web3 application development
- Blockchain transaction handling
- Smart contract testing
- GitHub-based project management

Overall, the project serves as a practical portfolio demonstration of integrating a decentralized smart contract with a modern web frontend.