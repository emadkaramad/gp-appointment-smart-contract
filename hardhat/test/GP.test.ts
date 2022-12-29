import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { GP } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { isCallTrace } from "hardhat/internal/hardhat-network/stack-traces/message-trace"
import { BookingStatus, Sex } from "./enums"

const getTime = (date: Date | string) => {
  return Math.floor(new Date(date).getTime() / 1000)
}

describe("GP", function () {
  let gp: GP
  let deployer: SignerWithAddress

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()
    const GP = await ethers.getContractFactory("GP")
    gp = await GP.connect(deployer).deploy("People GP", "GP admin (Deployer)")

    await gp.deployed()
  })

  describe("addAdmin", () => {
    it("should add new admin when user is admin", async () => {
      const [, otherAdmin] = await ethers.getSigners()
      await gp.addAdmin(otherAdmin.address, "Robert Blair")

      const admins = await gp.connect(otherAdmin).getAdmins()
      expect(admins).to.have.length(2)
      expect(admins).to.deep.equal([deployer.address, otherAdmin.address])
    })

    it("should not add new admin when user is not admin", async () => {
      const [, otherAdmin, user1] = await ethers.getSigners()
      const tx = gp.connect(user1).addAdmin(otherAdmin.address, "Robert Blair")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )

      const admins = await gp.getAdmins()
      expect(admins).to.have.length(1)
      expect(admins).to.deep.equal([deployer.address])
    })
  })

  describe("addDoctor", () => {
    it("should add doctor when added by admin", async () => {
      const [, doctor] = await ethers.getSigners()
      await gp
        .connect(deployer)
        .addDoctor(doctor.address, "Raleigh Stokes", "General")

      const doctors = await gp.getDoctors()
      expect(doctors).to.have.length(1)

      const { name, specialty, active } = await gp.getDoctor(doctors[0])
      expect({ name, specialty, active }).to.deep.equal({
        active: true,
        name: "Raleigh Stokes",
        specialty: "General",
      })
    })

    it("should not add doctor when added by non-admin", async () => {
      const [, doctor, nonAdmin] = await ethers.getSigners()

      const tx = gp
        .connect(nonAdmin)
        .addDoctor(doctor.address, "Lynda Johns", "Dermatologist")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )

      const doctors = await gp.getDoctors()
      expect(doctors).to.have.length(0)
    })
  })

  describe("addPatient for connected account", () => {
    it("should add petient if not already added", async () => {
      const [, patient] = await ethers.getSigners()

      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )

      const patients = await gp.getPatients()
      expect(patients).to.have.length(1)

      const { name, balance, birthSex, dateOfBirth, active } =
        await gp.getPatient(patients[0])
      expect({ name, balance, birthSex, dateOfBirth, active }).to.deep.equal({
        active: true,
        balance: 0,
        name: "Natalia Mayo",
        dateOfBirth: getTime("1990-06-12"),
        birthSex: Sex.Female,
      })
    })

    it("should not add patient if already added", async () => {
      const [, patient] = await ethers.getSigners()

      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )

      let patients = await gp.getPatients()
      expect(patients).to.have.length(1)

      let { name, balance, birthSex, dateOfBirth, active } =
        await gp.getPatient(patients[0])
      expect({ name, balance, birthSex, dateOfBirth, active }).to.deep.equal({
        active: true,
        balance: 0,
        name: "Natalia Mayo",
        dateOfBirth: getTime("1990-06-12"),
        birthSex: Sex.Female,
      })

      // Adding the same patient again with different details
      const tx = gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Felton Blackwell",
          getTime("1995-02-27"),
          Sex.Male
        )

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__AddPatient__AlreadyRegistered"
      )

      patients = await gp.getPatients()
      expect(patients).to.have.length(1)
      ;({ name, balance, birthSex, dateOfBirth, active } = await gp.getPatient(
        patients[0]
      ))
      expect({ name, balance, birthSex, dateOfBirth, active }).to.deep.equal({
        active: true,
        balance: 0,
        name: "Natalia Mayo",
        dateOfBirth: getTime("1990-06-12"),
        birthSex: Sex.Female,
      })
    })
  })

  describe("addPatient using different account by having patient account address", () => {
    it("should add patient by patient address if connected account is an admin", async () => {
      const [, patient] = await ethers.getSigners()

      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Janet Martin",
        getTime("2001-08-09"),
        Sex.Female
      )

      const patients = await gp.getPatients()
      expect(patients).to.have.length(1)

      const { active, name, dateOfBirth, birthSex, balance } =
        await gp.getPatient(patients[0])
      expect({ active, name, dateOfBirth, birthSex, balance }).to.deep.equal({
        active: true,
        balance: 0,
        name: "Janet Martin",
        dateOfBirth: getTime("2001-08-09"),
        birthSex: Sex.Female,
      })
    })

    it("should not add patient by patient address if connected account is not an admin", async () => {
      const [, patient, nonAdmin] = await ethers.getSigners()

      const tx = gp
        .connect(nonAdmin)
        ["addPatient(address,string,uint256,uint8)"](
          patient.address,
          "Janet Martin",
          getTime("2001-08-09"),
          Sex.Female
        )
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )

      const patients = await gp.getPatients()
      expect(patients).to.have.length(0)
    })

    it("should not add patient by patient address if already added", async () => {
      const [, patient] = await ethers.getSigners()

      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Janet Martin",
        getTime("2001-08-09"),
        Sex.Female
      )

      let patients = await gp.getPatients()
      expect(patients).to.have.length(1)

      let { active, name, dateOfBirth, birthSex, balance } =
        await gp.getPatient(patients[0])
      expect({ active, name, dateOfBirth, birthSex, balance }).to.deep.equal({
        active: true,
        balance: 0,
        name: "Janet Martin",
        dateOfBirth: getTime("2001-08-09"),
        birthSex: Sex.Female,
      })

      // Adding the patient again with different details
      const tx = gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Janet Martin",
        getTime("2001-08-09"),
        Sex.Female
      )
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__AddPatient__AlreadyRegistered"
      )

      patients = await gp.getPatients()
      expect(patients).to.have.length(1)
      ;({ active, name, dateOfBirth, birthSex, balance } = await gp.getPatient(
        patients[0]
      ))
      expect({ active, name, dateOfBirth, birthSex, balance }).to.deep.equal({
        active: true,
        balance: 0,
        name: "Janet Martin",
        dateOfBirth: getTime("2001-08-09"),
        birthSex: Sex.Female,
      })
    })
  })

  describe("addBooking", () => {
    it("should add booking when added by admin", async () => {
      const [, doctor] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add booking
      const expectedDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future
      const expectedDateKey = `${expectedDate.getFullYear()}-${String(
        expectedDate.getMonth()
      ).padStart(1, "0")}-${String(expectedDate.getDate()).padStart(1, "0")}`
      const expectedFee = ethers.utils.parseEther("0.001")
      await gp.addBooking(
        getTime(expectedDate),
        expectedDateKey,
        doctor.address,
        expectedFee
      )

      const bookings = await gp.getBookings(expectedDateKey)
      expect(bookings).to.have.length(1)

      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        fee,
        patientAddress,
        patientNote,
        status,
      } = await gp.getBooking(bookings[0])
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        fee,
        patientAddress,
        patientNote,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(expectedDate),
        appointmentDateKey: expectedDateKey,
        doctorAddress: doctor.address,
        fee: expectedFee,
        patientAddress: "0",
        patientNote: "",
        status: BookingStatus.Available,
      })
    })

    it("should not add booking when added by non admin", async () => {
      const [, doctor, nonAdmin] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add booking
      const expectedDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future
      const expectedDateKey = `${expectedDate.getFullYear()}-${String(
        expectedDate.getMonth()
      ).padStart(1, "0")}-${String(expectedDate.getDate()).padStart(1, "0")}`
      const expectedFee = ethers.utils.parseEther("0.001")
      const tx = gp
        .connect(nonAdmin)
        .addBooking(
          getTime(expectedDate),
          expectedDateKey,
          doctor.address,
          expectedFee
        )

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )
    })
  })

  describe("book", () => {
    let doctor: SignerWithAddress
    let patient: SignerWithAddress
    let nonPatient: SignerWithAddress
    const expectedDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour in the future
    const expectedDateKey = `${expectedDate.getFullYear()}-${String(
      expectedDate.getMonth()
    ).padStart(1, "0")}-${String(expectedDate.getDate()).padStart(1, "0")}`
    const expectedFee = ethers.utils.parseEther("0.001")

    beforeEach(async () => {
      ;[, doctor, patient, nonPatient] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add patient
      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Anthony Beck",
        getTime("1980-01-02"),
        Sex.Male
      )

      // Add booking
      await gp.addBooking(
        getTime(expectedDate),
        expectedDateKey,
        doctor.address,
        expectedFee
      )
    })

    it("should book an appointment", async () => {
      const tx = gp.connect(patient).book(0, "Headache and sore throat", {
        value: expectedFee,
      })

      await expect(tx)
        .to.emit(gp, "AppointmentBooked")
        .withArgs(0, doctor.address, getTime(expectedDate))

      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        fee,
        patientAddress,
        patientNote,
        status,
      } = await gp.getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        fee,
        patientAddress,
        patientNote,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(expectedDate),
        appointmentDateKey: expectedDateKey,
        doctorAddress: doctor.address,
        fee: expectedFee,
        patientAddress: patient.address,
        patientNote: "Headache and sore throat",
        status: BookingStatus.Booked,
      })
    })

    it("should not book when not enough fee is paid", async () => {
      const tx = gp.connect(patient).book(0, "Headache and sore throat", {
        value: ethers.utils.parseEther("0.0001"),
      })

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__Book__InvalidFeePaid"
      )
    })

    it("should not book when patient does not exist", async () => {
      const tx = gp.connect(nonPatient).book(0, "Headache and sore throat", {
        value: expectedFee,
      })

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyPatient__NotRegistered"
      )
    })

    it("should not book when booking is already booked", async () => {
      await gp.connect(patient).book(0, "Headache and sore throat", {
        value: expectedFee,
      })

      const tx = gp.connect(patient).book(0, "Headache and sore throat", {
        value: expectedFee,
      })

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__Book__NotAvailable"
      )
    })

    it("should not book when booking does not exist", async () => {
      const tx = gp.connect(patient).book(100, "Headache and sore throat", {
        value: expectedFee,
      })

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__Book__InvalidBooking"
      )
    })

    it("should not book when booking is in the past", async () => {
      await gp.addBooking(
        getTime("2022-01-01T10:10:10.000Z"),
        "2022-01-01",
        doctor.address,
        expectedFee
      )

      const [bookingId] = await gp.getBookings("2022-01-01")

      const tx = gp.connect(patient).book(bookingId, "Headache and sore throat", {
        value: expectedFee,
      })

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__Book__NotAvailable"
      )
    })
  })

  describe("getAdmins", () => {
    it("should return admins if requested by admin", async () => {
      const admins = await gp.getAdmins()
      expect(admins).to.have.length(1)
      expect(admins).to.deep.equal([deployer.address])
    })

    it("should not return admins if requested by non-admin", async () => {
      const [, user1] = await ethers.getSigners()
      const tx = gp.connect(user1).getAdmins()
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )
    })
  })
})
