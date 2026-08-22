const { expect } = require("chai");

describe("FreelanceEscrow", function () {

    let escrow;
    let client;
    let freelancer;
    let attacker;
    let arbitrator;

    const projectTitle = "Blockchain Website Development";

    // --------------------------------------------------
    // BEFORE EACH TEST
    // --------------------------------------------------

    beforeEach(async function () {

        [client, freelancer, attacker, arbitrator] =
            await ethers.getSigners();

        const FreelanceEscrow =
            await ethers.getContractFactory(
                "FreelanceEscrow"
            );

        // IMPORTANT:
        // Pass the arbitrator address to the constructor.
        escrow =
            await FreelanceEscrow.deploy(
                arbitrator.address
            );

        await escrow.deployed();

        // Verify correct arbitrator
        expect(
            await escrow.arbitrator()
        ).to.equal(
            arbitrator.address
        );
    });

    // --------------------------------------------------
    // HELPER: CREATE PROJECT
    // --------------------------------------------------

    async function createProject() {

        await escrow
            .connect(client)
            .createEscrow(
                freelancer.address,
                projectTitle
            );
    }

    // --------------------------------------------------
    // HELPER: CREATE + FUND PROJECT
    // --------------------------------------------------

    async function createAndFundProject() {

        await createProject();

        await escrow
            .connect(client)
            .fundEscrow(1, {
                value: ethers.utils.parseEther("1")
            });
    }

    // --------------------------------------------------
    // TEST 1
    // --------------------------------------------------

    it("Client can create escrow", async function () {

        await createProject();

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[0]).to.equal(1);

        expect(result[1]).to.equal(
            client.address
        );

        expect(result[2]).to.equal(
            freelancer.address
        );

        expect(result[4]).to.equal(0);

        expect(result[6]).to.equal(
            projectTitle
        );
    });

    // --------------------------------------------------
    // TEST 2
    // --------------------------------------------------

    it("Rejects invalid freelancer address",
        async function () {

        await expect(
            escrow
                .connect(client)
                .createEscrow(
                    ethers.constants.AddressZero,
                    projectTitle
                )
        ).to.be.revertedWith(
            "Invalid freelancer address"
        );
    });

    // --------------------------------------------------
    // TEST 3
    // --------------------------------------------------

    it("Accepts correct funding amount",
        async function () {

        await createProject();

        await escrow
            .connect(client)
            .fundEscrow(1, {
                value: ethers.utils.parseEther("1")
            });

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[3]).to.equal(
            ethers.utils.parseEther("1")
        );

        expect(result[4]).to.equal(1);

        expect(
            await escrow.getContractBalance()
        ).to.equal(
            ethers.utils.parseEther("1")
        );
    });

    // --------------------------------------------------
    // TEST 4
    // --------------------------------------------------

    it("Rejects zero funding",
        async function () {

        await createProject();

        await expect(
            escrow
                .connect(client)
                .fundEscrow(1, {
                    value: 0
                })
        ).to.be.revertedWith(
            "Funding amount must be greater than zero"
        );
    });

    // --------------------------------------------------
    // TEST 5
    // --------------------------------------------------

    it("Freelancer can start work",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[4]).to.equal(2);
    });

    // --------------------------------------------------
    // TEST 6
    // --------------------------------------------------

    it("Unauthorized user cannot start work",
        async function () {

        await createAndFundProject();

        await expect(
            escrow
                .connect(attacker)
                .startWork(1)
        ).to.be.revertedWith(
            "Only freelancer can perform this action"
        );
    });

    // --------------------------------------------------
    // TEST 7
    // --------------------------------------------------

    it("Freelancer can submit work",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(freelancer)
            .submitWork(1);

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[4]).to.equal(3);
    });

    // --------------------------------------------------
    // TEST 8
    // --------------------------------------------------

    it("Client can approve and release payment",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(freelancer)
            .submitWork(1);

        const beforeBalance =
            await ethers.provider.getBalance(
                freelancer.address
            );

        const tx =
            await escrow
                .connect(client)
                .approveAndReleasePayment(1);

        await tx.wait();

        const afterBalance =
            await ethers.provider.getBalance(
                freelancer.address
            );

        expect(afterBalance).to.equal(
            beforeBalance.add(
                ethers.utils.parseEther("1")
            )
        );

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[3]).to.equal(0);

        expect(result[4]).to.equal(4);

        expect(
            await escrow.getContractBalance()
        ).to.equal(0);
    });

    // --------------------------------------------------
    // TEST 9
    // --------------------------------------------------

    it("Payment cannot be released twice",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(freelancer)
            .submitWork(1);

        await escrow
            .connect(client)
            .approveAndReleasePayment(1);

        await expect(
            escrow
                .connect(client)
                .approveAndReleasePayment(1)
        ).to.be.revertedWith(
            "Work has not been submitted"
        );
    });

    // --------------------------------------------------
    // TEST 10
    // --------------------------------------------------

    it("Client can cancel before work starts",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(client)
            .cancelAndRefund(1);

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[3]).to.equal(0);

        expect(result[4]).to.equal(7);

        expect(
            await escrow.getContractBalance()
        ).to.equal(0);
    });

    // --------------------------------------------------
    // TEST 11
    // --------------------------------------------------

    it("Unauthorized user cannot cancel escrow",
        async function () {

        await createAndFundProject();

        await expect(
            escrow
                .connect(attacker)
                .cancelAndRefund(1)
        ).to.be.revertedWith(
            "Only client can perform this action"
        );
    });

    // --------------------------------------------------
    // TEST 12
    // --------------------------------------------------

    it("Participant can raise dispute",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(freelancer)
            .raiseDispute(1);

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[4]).to.equal(6);
    });

    // --------------------------------------------------
    // TEST 13
    // --------------------------------------------------

    it("Arbitrator can resolve dispute in freelancer's favor",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(client)
            .raiseDispute(1);

        await escrow
            .connect(arbitrator)
            .resolveDispute(1, true);

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[3]).to.equal(0);

        expect(result[4]).to.equal(4);

        expect(
            await escrow.getContractBalance()
        ).to.equal(0);
    });

    // --------------------------------------------------
    // TEST 14
    // --------------------------------------------------

    it("Arbitrator can resolve dispute with client refund",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(client)
            .raiseDispute(1);

        await escrow
            .connect(arbitrator)
            .resolveDispute(1, false);

        const result =
            await escrow.getEscrowDetails(1);

        expect(result[3]).to.equal(0);

        expect(result[4]).to.equal(7);

        expect(
            await escrow.getContractBalance()
        ).to.equal(0);
    });

    // --------------------------------------------------
    // TEST 15
    // --------------------------------------------------

    it("Unauthorized user cannot resolve dispute",
        async function () {

        await createAndFundProject();

        await escrow
            .connect(freelancer)
            .startWork(1);

        await escrow
            .connect(client)
            .raiseDispute(1);

        await expect(
            escrow
                .connect(attacker)
                .resolveDispute(1, true)
        ).to.be.revertedWith(
            "Only arbitrator can perform this action"
        );
    });

});