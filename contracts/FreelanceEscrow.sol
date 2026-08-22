// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FreelanceEscrow
 * @dev Smart Contract-Based Freelance Payment Escrow System
 *
 * Workflow:
 *
 * Client creates escrow
 *        ↓
 * Client funds escrow
 *        ↓
 * Freelancer starts work
 *        ↓
 * Freelancer submits work
 *        ↓
 * Client approves work
 *        ↓
 * Freelancer receives payment
 *
 * Alternative:
 *
 * Client cancels before work starts
 *        ↓
 * Client receives refund
 *
 * Dispute:
 *
 * Either party raises dispute
 *        ↓
 * Arbitrator resolves dispute
 */
contract FreelanceEscrow {

    // --------------------------------------------------
    // ENUMS
    // --------------------------------------------------

    enum EscrowState {
        CREATED,
        FUNDED,
        IN_PROGRESS,
        SUBMITTED,
        COMPLETED,
        CANCELLED,
        DISPUTED,
        REFUNDED
    }

    // --------------------------------------------------
    // STRUCT
    // --------------------------------------------------

    struct Escrow {
        uint256 projectId;
        address payable client;
        address payable freelancer;
        uint256 amount;
        EscrowState state;
        uint256 createdAt;
        string projectTitle;
    }

    // --------------------------------------------------
    // STATE VARIABLES
    // --------------------------------------------------

    uint256 private nextProjectId = 1;

    address public arbitrator;

    mapping(uint256 => Escrow) private escrows;

    // --------------------------------------------------
    // EVENTS
    // --------------------------------------------------

    event EscrowCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        string projectTitle
    );

    event FundsDeposited(
        uint256 indexed projectId,
        address indexed client,
        uint256 amount
    );

    event WorkStarted(
        uint256 indexed projectId,
        address indexed freelancer
    );

    event WorkSubmitted(
        uint256 indexed projectId,
        address indexed freelancer
    );

    event PaymentReleased(
        uint256 indexed projectId,
        address indexed freelancer,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed projectId,
        address indexed client,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed projectId,
        address indexed raisedBy
    );

    event DisputeResolved(
        uint256 indexed projectId,
        bool paidToFreelancer,
        uint256 amount
    );

    // --------------------------------------------------
    // MODIFIERS
    // --------------------------------------------------

    modifier onlyClient(uint256 projectId) {
        require(
            msg.sender == escrows[projectId].client,
            "Only client can perform this action"
        );
        _;
    }

    modifier onlyFreelancer(uint256 projectId) {
        require(
            msg.sender == escrows[projectId].freelancer,
            "Only freelancer can perform this action"
        );
        _;
    }

    modifier onlyArbitrator() {
        require(
            msg.sender == arbitrator,
            "Only arbitrator can perform this action"
        );
        _;
    }

    modifier validProject(uint256 projectId) {
        require(
            projectId > 0 && projectId < nextProjectId,
            "Invalid project ID"
        );
        _;
    }

    // --------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------

    constructor(address _arbitrator) {
        require(
            _arbitrator != address(0),
            "Invalid arbitrator address"
        );

        arbitrator = _arbitrator;
    }

    // --------------------------------------------------
    // CREATE ESCROW
    // --------------------------------------------------

    function createEscrow(
        address payable freelancer,
        string calldata projectTitle
    )
        external
        returns (uint256)
    {
        require(
            freelancer != address(0),
            "Invalid freelancer address"
        );

        require(
            freelancer != msg.sender,
            "Client and freelancer must differ"
        );

        require(
            bytes(projectTitle).length > 0,
            "Project title required"
        );

        uint256 projectId = nextProjectId;

        escrows[projectId] = Escrow({
            projectId: projectId,
            client: payable(msg.sender),
            freelancer: freelancer,
            amount: 0,
            state: EscrowState.CREATED,
            createdAt: block.timestamp,
            projectTitle: projectTitle
        });

        nextProjectId++;

        emit EscrowCreated(
            projectId,
            msg.sender,
            freelancer,
            0,
            projectTitle
        );

        return projectId;
    }

    // --------------------------------------------------
    // FUND ESCROW
    // --------------------------------------------------

    function fundEscrow(uint256 projectId)
        external
        payable
        validProject(projectId)
        onlyClient(projectId)
    {
        Escrow storage escrow = escrows[projectId];

        require(
            escrow.state == EscrowState.CREATED,
            "Escrow is not in CREATED state"
        );

        require(
            msg.value > 0,
            "Funding amount must be greater than zero"
        );

        escrow.amount = msg.value;
        escrow.state = EscrowState.FUNDED;

        emit FundsDeposited(
            projectId,
            msg.sender,
            msg.value
        );
    }

    // --------------------------------------------------
    // START WORK
    // --------------------------------------------------

    function startWork(uint256 projectId)
        external
        validProject(projectId)
        onlyFreelancer(projectId)
    {
        Escrow storage escrow = escrows[projectId];

        require(
            escrow.state == EscrowState.FUNDED,
            "Escrow must be funded"
        );

        escrow.state = EscrowState.IN_PROGRESS;

        emit WorkStarted(
            projectId,
            msg.sender
        );
    }

    // --------------------------------------------------
    // SUBMIT WORK
    // --------------------------------------------------

    function submitWork(uint256 projectId)
        external
        validProject(projectId)
        onlyFreelancer(projectId)
    {
        Escrow storage escrow = escrows[projectId];

        require(
            escrow.state == EscrowState.IN_PROGRESS,
            "Work is not in progress"
        );

        escrow.state = EscrowState.SUBMITTED;

        emit WorkSubmitted(
            projectId,
            msg.sender
        );
    }

    // --------------------------------------------------
    // APPROVE AND RELEASE PAYMENT
    // --------------------------------------------------

    function approveAndReleasePayment(uint256 projectId)
        external
        validProject(projectId)
        onlyClient(projectId)
    {
        Escrow storage escrow = escrows[projectId];

        require(
            escrow.state == EscrowState.SUBMITTED,
            "Work has not been submitted"
        );

        uint256 payment = escrow.amount;

        require(
            payment > 0,
            "No payment available"
        );

        // Checks-Effects-Interactions
        escrow.amount = 0;
        escrow.state = EscrowState.COMPLETED;

        (bool success, ) = escrow.freelancer.call{
            value: payment
        }("");

        require(
            success,
            "Payment transfer failed"
        );

        emit PaymentReleased(
            projectId,
            escrow.freelancer,
            payment
        );
    }

    // --------------------------------------------------
    // CANCEL AND REFUND
    // --------------------------------------------------

    function cancelAndRefund(uint256 projectId)
        external
        validProject(projectId)
        onlyClient(projectId)
    {
        Escrow storage escrow = escrows[projectId];

        require(
            escrow.state == EscrowState.CREATED ||
            escrow.state == EscrowState.FUNDED,
            "Escrow cannot be cancelled now"
        );

        uint256 refundAmount = escrow.amount;

        escrow.amount = 0;
        escrow.state = EscrowState.REFUNDED;

        if (refundAmount > 0) {
            (bool success, ) = escrow.client.call{
                value: refundAmount
            }("");

            require(
                success,
                "Refund transfer failed"
            );
        }

        emit RefundIssued(
            projectId,
            escrow.client,
            refundAmount
        );
    }

    // --------------------------------------------------
    // RAISE DISPUTE
    // --------------------------------------------------

    function raiseDispute(uint256 projectId)
        external
        validProject(projectId)
    {
        Escrow storage escrow = escrows[projectId];

        require(
            msg.sender == escrow.client ||
            msg.sender == escrow.freelancer,
            "Only project participants can dispute"
        );

        require(
            escrow.state == EscrowState.FUNDED ||
            escrow.state == EscrowState.IN_PROGRESS ||
            escrow.state == EscrowState.SUBMITTED,
            "Dispute cannot be raised in current state"
        );

        escrow.state = EscrowState.DISPUTED;

        emit DisputeRaised(
            projectId,
            msg.sender
        );
    }

    // --------------------------------------------------
    // RESOLVE DISPUTE
    // --------------------------------------------------

    function resolveDispute(
        uint256 projectId,
        bool payFreelancer
    )
        external
        validProject(projectId)
        onlyArbitrator
    {
        Escrow storage escrow = escrows[projectId];

        require(
            escrow.state == EscrowState.DISPUTED,
            "Escrow is not disputed"
        );

        uint256 amount = escrow.amount;

        require(
            amount > 0,
            "No funds available"
        );

        escrow.amount = 0;

        if (payFreelancer) {

            escrow.state = EscrowState.COMPLETED;

            (bool success, ) = escrow.freelancer.call{
                value: amount
            }("");

            require(
                success,
                "Freelancer payment failed"
            );

        } else {

            escrow.state = EscrowState.REFUNDED;

            (bool success, ) = escrow.client.call{
                value: amount
            }("");

            require(
                success,
                "Client refund failed"
            );
        }

        emit DisputeResolved(
            projectId,
            payFreelancer,
            amount
        );
    }

    // --------------------------------------------------
    // GET ESCROW DETAILS
    // --------------------------------------------------

    function getEscrowDetails(uint256 projectId)
        external
        view
        validProject(projectId)
        returns (
            uint256,
            address,
            address,
            uint256,
            EscrowState,
            uint256,
            string memory
        )
    {
        Escrow memory escrow = escrows[projectId];

        return (
            escrow.projectId,
            escrow.client,
            escrow.freelancer,
            escrow.amount,
            escrow.state,
            escrow.createdAt,
            escrow.projectTitle
        );
    }

    // --------------------------------------------------
    // GET CONTRACT BALANCE
    // --------------------------------------------------

    function getContractBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    // --------------------------------------------------
    // GET NEXT PROJECT ID
    // --------------------------------------------------

    function getNextProjectId()
        external
        view
        returns (uint256)
    {
        return nextProjectId;
    }
}