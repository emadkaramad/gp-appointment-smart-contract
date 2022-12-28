import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { GP } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { isCallTrace } from "hardhat/internal/hardhat-network/stack-traces/message-trace"

describe("GP", function () {
  let gp: GP
  let deployer: SignerWithAddress

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()
    const GP = await ethers.getContractFactory("GP")
    gp = await GP.connect(deployer).deploy("People GP", "GP admin (Deployer)")

    await gp.deployed()
  })

  it("should add new admin when user is admin", async () => {
    const [, otherAdmin] = await ethers.getSigners()
    await gp.addAdmin(otherAdmin.address, "Robert Blair")

    const admins = await gp.connect(otherAdmin).getAdmins()
    expect(admins).to.have.length(2)
    expect(admins).to.deep.equal([deployer.address, otherAdmin.address])
  })

  it("should not add new admin when user is not admin", async () => {
    const [, otherAdmin, user1] = await ethers.getSigners()
    const user1GP = gp.connect(user1)
    expect(
      user1GP.addAdmin(otherAdmin.address, "Robert Blair")
    ).to.be.revertedWith("OnlyAdmin__NotAnAdmin")

    const admins = await gp.getAdmins()
    expect(admins).to.have.length(1)
    expect(admins).to.deep.equal([deployer.address])
  })

  it("should return admins if requested by admin", async () => {
    const admins = await gp.getAdmins()
    expect(admins).to.have.length(1)
    expect(admins).to.deep.equal([deployer.address])
  })

  it("should not return admins if requested by non-admin", async () => {
    const [, user1] = await ethers.getSigners()
    const userGP = gp.connect(user1)
    expect(userGP.getAdmins()).to.be.revertedWith("OnlyAdmin__NotAnAdmin")
  })
})
