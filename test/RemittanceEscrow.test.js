const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const AMOUNT = 30_000_000n; // 30 USDT (6 decimals)
const CODE = "482913";
const id = ethers.id("transfer-1");
const claimHash = ethers.keccak256(ethers.toUtf8Bytes(CODE));

async function setup() {
  const [backend, offRamp, other] = await ethers.getSigners();
  const token = await ethers.deployContract("MockUSDT");
  const escrow = await ethers.deployContract("RemittanceEscrow", [token.target, offRamp.address]);
  await token.mint(backend.address, 1_000_000_000n);
  await token.approve(escrow.target, ethers.MaxUint256);
  const expiry = BigInt((await time.latest()) + 3600);
  return { backend, offRamp, other, token, escrow, expiry };
}

describe("RemittanceEscrow", () => {
  it("happy path: deposit then claim pays the off-ramp", async () => {
    const { token, escrow, offRamp, expiry } = await loadFixture(setup);
    await expect(escrow.deposit(id, AMOUNT, claimHash, expiry)).to.emit(escrow, "Deposited");
    expect(await token.balanceOf(escrow.target)).to.equal(AMOUNT);
    await expect(escrow.claim(id, CODE)).to.emit(escrow, "Claimed").withArgs(id, offRamp.address, AMOUNT);
    expect(await token.balanceOf(offRamp.address)).to.equal(AMOUNT);
    expect(await token.balanceOf(escrow.target)).to.equal(0n);
  });

  it("rejects a wrong claim code", async () => {
    const { escrow, expiry } = await loadFixture(setup);
    await escrow.deposit(id, AMOUNT, claimHash, expiry);
    await expect(escrow.claim(id, "000000")).to.be.revertedWithCustomError(escrow, "WrongClaimCode");
  });

  it("rejects a double claim", async () => {
    const { escrow, expiry } = await loadFixture(setup);
    await escrow.deposit(id, AMOUNT, claimHash, expiry);
    await escrow.claim(id, CODE);
    await expect(escrow.claim(id, CODE)).to.be.revertedWithCustomError(escrow, "NotPending");
  });

  it("rejects a claim after expiry", async () => {
    const { escrow, expiry } = await loadFixture(setup);
    await escrow.deposit(id, AMOUNT, claimHash, expiry);
    await time.increaseTo(expiry);
    await expect(escrow.claim(id, CODE)).to.be.revertedWithCustomError(escrow, "Expired");
  });

  it("rejects a refund before expiry", async () => {
    const { escrow, expiry } = await loadFixture(setup);
    await escrow.deposit(id, AMOUNT, claimHash, expiry);
    await expect(escrow.refund(id)).to.be.revertedWithCustomError(escrow, "NotExpired");
  });

  it("refunds the depositor after expiry, once only", async () => {
    const { token, escrow, backend, expiry } = await loadFixture(setup);
    const before = await token.balanceOf(backend.address);
    await escrow.deposit(id, AMOUNT, claimHash, expiry);
    await time.increaseTo(expiry);
    await expect(escrow.refund(id)).to.emit(escrow, "Refunded").withArgs(id, backend.address, AMOUNT);
    expect(await token.balanceOf(backend.address)).to.equal(before);
    await expect(escrow.refund(id)).to.be.revertedWithCustomError(escrow, "NotPending");
  });

  it("rejects a duplicate transferId", async () => {
    const { escrow, expiry } = await loadFixture(setup);
    await escrow.deposit(id, AMOUNT, claimHash, expiry);
    await expect(escrow.deposit(id, AMOUNT, claimHash, expiry)).to.be.revertedWithCustomError(escrow, "AlreadyExists");
  });
});
