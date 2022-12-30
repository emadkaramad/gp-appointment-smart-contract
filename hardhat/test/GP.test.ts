import { time } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { GP } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BookingStatus, Sex } from "../../common"

const getTime = (date: Date | string) => {
  return Math.floor(new Date(date).getTime() / 1000)
}

const now = async () => (await time.latest()) * 1000

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
      const expectedDate = new Date((await now()) + 60 * 60 * 1000) // 1 hour in the future
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
        status,
      } = await gp.getBooking(bookings[0])
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        fee,
        patientAddress,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(expectedDate),
        appointmentDateKey: expectedDateKey,
        doctorAddress: doctor.address,
        fee: expectedFee,
        patientAddress: "0",
        status: BookingStatus.Available,
      })
    })

    it("should not add booking when added by non admin", async () => {
      const [, doctor, nonAdmin] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add booking
      const expectedDate = new Date((await now()) + 60 * 60 * 1000) // 1 hour in the future
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
    const expectedFee = ethers.utils.parseEther("0.001")
    let expectedDate: Date, expectedDateKey: string

    beforeEach(async () => {
      expectedDate = new Date((await now()) + 60 * 60 * 1000) // 1 hour in the future
      expectedDateKey = `${expectedDate.getFullYear()}-${String(
        expectedDate.getMonth()
      ).padStart(1, "0")}-${String(expectedDate.getDate()).padStart(1, "0")}`
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
        status,
      } = await gp.getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        fee,
        patientAddress,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(expectedDate),
        appointmentDateKey: expectedDateKey,
        doctorAddress: doctor.address,
        fee: expectedFee,
        patientAddress: patient.address,
        status: BookingStatus.Booked,
      })

      const notes = await gp.getNotes(patientAddress)
      const note = await gp.connect(patient).getNote(notes.at(-1)!)
      expect(note.addedBy).to.equal(patient.address)
      expect(note.timestamp).to.be.greaterThan(0)
      expect(note.note).to.equal("Headache and sore throat")
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

      const tx = gp
        .connect(patient)
        .book(bookingId, "Headache and sore throat", {
          value: expectedFee,
        })

      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__Book__NotAvailable"
      )
    })
  })

  describe("cancelBooking", () => {
    let doctor: SignerWithAddress
    let patient: SignerWithAddress
    let nonPatient: SignerWithAddress
    const generateDate = async (hoursToAddToNow: number) =>
      new Date((await now()) + hoursToAddToNow * 60 * 60 * 1000)
    const generateDateKey = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth()).padStart(
        1,
        "0"
      )}-${String(date.getDate()).padStart(1, "0")}`
    const expectedFee = ethers.utils.parseEther("0.001")

    beforeEach(async () => {
      ;[, doctor, patient, nonPatient] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add patient
      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Tom Brandt",
        getTime("1982-12-18"),
        Sex.Male
      )
    })

    it("should cancel booking and refund 100% of the fee when requested by patient more than 24 hours before the appointment", async () => {
      const date = await generateDate(25) // 25 hours from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Cancel booking
      const tx = gp.connect(patient).cancelBooking(0)
      expect(tx)
        .to.emit(gp, "AppointmentCancelled")
        .withArgs(0, doctor.address, getTime(date))

      const { patientAddress, status } = await gp.connect(doctor).getBooking(0)
      expect({ patientAddress, status }).to.deep.equal({
        patientAddress: patient.address,
        status: BookingStatus.Cancelled,
      })

      // Check if new booking is created
      const bookings = await gp.getBookings(dateKey)
      const newBooking = await gp.getBooking(bookings.at(-1)!)
      expect(newBooking.appointmentDate).to.equal(getTime(date))
      expect(newBooking.appointmentDateKey).to.equal(dateKey)
      expect(newBooking.doctorAddress).to.equal(doctor.address)
      expect(newBooking.fee).to.equal(expectedFee)
      expect(newBooking.status).to.equal(BookingStatus.Available)

      const { balance } = await gp.getPatient(patient.address)
      expect(balance).to.equal(expectedFee)

      const notes = await gp.getNotes(patient.address)
      const note = await gp.connect(patient).getNote(notes.at(-1)!)
      expect(note.addedBy).to.equal(patient.address)
      expect(note.note).to.equal(`Refunded amount: ${balance}`)
    })

    it("should cancel booking and refund 50% of the fee when requested by patient less than 24 hours before the appointment", async () => {
      const date = await generateDate(23) // 23 hours from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Cancel booking
      const tx = gp.connect(patient).cancelBooking(0)
      expect(tx)
        .to.emit(gp, "AppointmentCancelled")
        .withArgs(0, doctor.address, getTime(date))

      const { patientAddress, status } = await gp.connect(doctor).getBooking(0)
      expect({ patientAddress, status }).to.deep.equal({
        patientAddress: patient.address,
        status: BookingStatus.Cancelled,
      })

      // Check if new booking is created
      const bookings = await gp.getBookings(dateKey)
      const newBooking = await gp.getBooking(bookings.at(-1)!)
      expect(newBooking.appointmentDate).to.equal(getTime(date))
      expect(newBooking.appointmentDateKey).to.equal(dateKey)
      expect(newBooking.doctorAddress).to.equal(doctor.address)
      expect(newBooking.fee).to.equal(expectedFee)
      expect(newBooking.status).to.equal(BookingStatus.Available)

      const { balance } = await gp.getPatient(patient.address)
      expect(balance).to.equal(expectedFee.div(2))

      const notes = await gp.getNotes(patient.address)
      const note = await gp.connect(patient).getNote(notes.at(-1)!)
      expect(note.addedBy).to.equal(patient.address)
      expect(note.note).to.equal(`Refunded amount: ${balance}`)
    })

    it("should cancel booking and not refund any fee when requested by patient less than 2 hours before the appointment", async () => {
      const date = await generateDate(1) // 1 hours from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Cancel booking
      const tx = gp.connect(patient).cancelBooking(0)
      expect(tx)
        .to.emit(gp, "AppointmentCancelled")
        .withArgs(0, doctor.address, getTime(date))

      const { patientAddress, status } = await gp.connect(doctor).getBooking(0)
      expect({ patientAddress, status }).to.deep.equal({
        patientAddress: patient.address,
        status: BookingStatus.Cancelled,
      })

      // Check if new booking is created
      const bookings = await gp.getBookings(dateKey)
      const newBooking = await gp.getBooking(bookings.at(-1)!)
      expect(newBooking.appointmentDate).to.equal(getTime(date))
      expect(newBooking.appointmentDateKey).to.equal(dateKey)
      expect(newBooking.doctorAddress).to.equal(doctor.address)
      expect(newBooking.fee).to.equal(expectedFee)
      expect(newBooking.status).to.equal(BookingStatus.Available)

      const { balance } = await gp.getPatient(patient.address)
      expect(balance).to.equal(0)
    })

    it("should cancel booking and refund 110% of the fee when requested by admin", async () => {
      const date = await generateDate(25) // 25 hours from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Cancel booking by admin
      const tx = gp.connect(deployer).cancelBooking(0)
      expect(tx)
        .to.emit(gp, "AppointmentCancelled")
        .withArgs(0, doctor.address, getTime(date))

      const { patientAddress, status } = await gp.connect(doctor).getBooking(0)
      expect({ patientAddress, status }).to.deep.equal({
        patientAddress: patient.address,
        status: BookingStatus.Cancelled,
      })

      // Check if new booking is created
      const bookings = await gp.getBookings(dateKey)
      const newBooking = await gp.getBooking(bookings.at(-1)!)
      expect(newBooking.appointmentDate).to.equal(getTime(date))
      expect(newBooking.appointmentDateKey).to.equal(dateKey)
      expect(newBooking.doctorAddress).to.equal(doctor.address)
      expect(newBooking.fee).to.equal(expectedFee)
      expect(newBooking.status).to.equal(BookingStatus.Available)

      const { balance } = await gp.getPatient(patient.address)
      expect(balance).to.equal(expectedFee.mul(110).div(100))

      const notes = await gp.getNotes(patient.address)
      const note = await gp.connect(deployer).getNote(notes.at(-1)!)
      expect(note.addedBy).to.equal(deployer.address)
      expect(note.note).to.equal(`Refunded amount: ${balance}`)
    })

    it("should not cancel booking if appointment is in the past", async () => {
      const date = await generateDate(1) // 1 hour from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Move block time by 2 hours so the appointment is in the past
      await time.increase(3600 * 2)

      // Cancel booking by admin
      const tx = gp.connect(patient).cancelBooking(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__CancelBooking__NotAvailable"
      )
    })

    it("should not cancel booking if cancelled by doctor account", async () => {
      const date = await generateDate(36) // 36 hours from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Cancel booking by admin
      const tx = gp.connect(doctor).cancelBooking(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__CancelBooking__NotAllowed"
      )
    })

    it("should not cancel booking if cancelled by other account", async () => {
      const date = await generateDate(36) // 36 hours from now
      const dateKey = generateDateKey(date)
      await gp.addBooking(getTime(date), dateKey, doctor.address, expectedFee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: expectedFee,
      })

      // Cancel booking by admin
      const tx = gp.connect(nonPatient).cancelBooking(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__CancelBooking__NotAllowed"
      )
    })

    it("should revert cancel booking if booking does not exist", async () => {
      // Cancel non-existent booking by admin
      const tx = gp.connect(patient).cancelBooking(1000)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__CancelBooking__InvalidBooking"
      )
    })
  })

  describe("markBookingAsNoShowUp", () => {
    let doctor: SignerWithAddress
    let otherDoctor: SignerWithAddress
    let patient: SignerWithAddress
    let nonPatient: SignerWithAddress
    const fee = ethers.utils.parseEther("0.001")
    let date: Date, dateKey: string

    beforeEach(async () => {
      date = new Date((await now()) + 60 * 60 * 1000)
      dateKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(
        1,
        "0"
      )}-${String(date.getDate()).padStart(1, "0")}`
      ;[, doctor, otherDoctor, patient, nonPatient] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add patient
      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Tom Brandt",
        getTime("1982-12-18"),
        Sex.Male
      )

      await gp.addBooking(getTime(date), dateKey, doctor.address, fee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: fee,
      })

      await gp.addBooking(getTime(date), dateKey, otherDoctor.address, fee)
      await gp.connect(patient).book(1, "Stomach pain", {
        value: fee,
      })
    })

    it("should mark booking as no show up when account is the doctor", async () => {
      await gp.connect(doctor).markBookingAsNoShowUp(0)

      const booking = await gp.getBooking(0)
      expect(booking.status).to.equal(BookingStatus.NoShowUp)
    })

    it("should revert marking booking as no show up when account is the patient", async () => {
      const tx = gp.connect(patient).markBookingAsNoShowUp(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })

    it("should revert marking booking as no show up when account is an admin", async () => {
      const tx = gp.connect(deployer).markBookingAsNoShowUp(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })

    it("should revert marking booking as no show up when other account is used", async () => {
      const tx = gp.connect(nonPatient).markBookingAsNoShowUp(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })

    it("should revert marking booking as no show up when booking does not exist", async () => {
      const tx = gp.connect(doctor).markBookingAsNoShowUp(1000)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__InvalidBooking"
      )
    })

    it("should revert marking booking as no show up when doctor is not the booking's doctor", async () => {
      const tx = gp.connect(doctor).markBookingAsNoShowUp(1)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })
  })

  describe("markBookingAsVisited", () => {
    let doctor: SignerWithAddress
    let otherDoctor: SignerWithAddress
    let patient: SignerWithAddress
    let nonPatient: SignerWithAddress
    const fee = ethers.utils.parseEther("0.001")
    let date: Date, dateKey: string

    beforeEach(async () => {
      date = new Date((await now()) + 60 * 60 * 1000)
      dateKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(
        1,
        "0"
      )}-${String(date.getDate()).padStart(1, "0")}`
      ;[, doctor, otherDoctor, patient, nonPatient] = await ethers.getSigners()

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add patient
      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Tom Brandt",
        getTime("1982-12-18"),
        Sex.Male
      )

      await gp.addBooking(getTime(date), dateKey, doctor.address, fee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: fee,
      })

      await gp.addBooking(getTime(date), dateKey, otherDoctor.address, fee)
      await gp.connect(patient).book(1, "Stomach pain", {
        value: fee,
      })
    })

    it("should mark booking as visited when account is the doctor", async () => {
      await gp.connect(doctor).markBookingAsVisited(0, "The patient is fine")

      const booking = await gp.getBooking(0)
      expect(booking.status).to.equal(BookingStatus.Visited)

      const notes = await gp.getNotes(patient.address)
      const note = await gp.connect(doctor).getNote(notes.at(-1)!)
      expect(note.note).to.equal("The patient is fine")
      expect(note.addedBy).to.equal(doctor.address)
      expect(note.timestamp).to.be.greaterThan(0)
    })

    it("should revert marking booking as visited when account is the patient", async () => {
      const tx = gp
        .connect(patient)
        .markBookingAsVisited(0, "The patient is fine")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })

    it("should revert marking booking as visited when account is an admin", async () => {
      const tx = gp
        .connect(deployer)
        .markBookingAsVisited(0, "The patient is fine")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })

    it("should revert marking booking as visited when other account is used", async () => {
      const tx = gp
        .connect(nonPatient)
        .markBookingAsVisited(0, "The patient is fine")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })

    it("should revert marking booking as visited when booking does not exist", async () => {
      const tx = gp
        .connect(doctor)
        .markBookingAsVisited(1000, "The patient is fine")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__InvalidBooking"
      )
    })

    it("should revert marking booking as visited when doctor is not the booking's doctor", async () => {
      const tx = gp
        .connect(doctor)
        .markBookingAsVisited(1, "The patient is fine")
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyDoctor__NotTheDoctor"
      )
    })
  })

  describe("withdrawPatientBalance", () => {
    let doctor: SignerWithAddress
    let otherDoctor: SignerWithAddress
    let patient: SignerWithAddress
    let otherPatient: SignerWithAddress
    let patientWithZeroContractBalance: SignerWithAddress
    let nonPatient: SignerWithAddress
    const fee = ethers.utils.parseEther("0.001")
    let date: Date, dateKey: string

    beforeEach(async () => {
      date = new Date((await now()) + 5 * 60 * 60 * 1000)
      dateKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(
        1,
        "0"
      )}-${String(date.getDate()).padStart(1, "0")}`
      ;[
        ,
        doctor,
        otherDoctor,
        patient,
        otherPatient,
        patientWithZeroContractBalance,
        nonPatient,
      ] = await ethers.getSigners()

      // Fund the contract
      await deployer.sendTransaction({
        from: deployer.address,
        to: gp.address,
        value: ethers.utils.parseEther("0.1"),
      })

      // Add doctor
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")

      // Add patients
      await gp["addPatient(address,string,uint256,uint8)"](
        patient.address,
        "Tom Brandt",
        getTime("1982-12-18"),
        Sex.Male
      )
      await gp["addPatient(address,string,uint256,uint8)"](
        otherPatient.address,
        "Robyn Gates",
        getTime("1985-11-05"),
        Sex.Male
      )
      await gp["addPatient(address,string,uint256,uint8)"](
        patientWithZeroContractBalance.address,
        "Teresa Vazquez",
        getTime("1989-02-24"),
        Sex.Female
      )

      await gp.addBooking(getTime(date), dateKey, doctor.address, fee)
      await gp.connect(patient).book(0, "Stomach pain", {
        value: fee,
      })
      await gp.cancelBooking(0)

      await gp.addBooking(getTime(date), dateKey, otherDoctor.address, fee)
      await gp.connect(patient).book(1, "Stomach pain", {
        value: fee,
      })
      await gp.cancelBooking(1)
    })

    it("should allow patient to withdraw their balance", async () => {
      const patientAccountBalanceBeforeWithdrawal = await patient.getBalance()
      const patientContractBalanceBeforeWithdrawal = (
        await gp.getPatient(patient.address)
      ).balance
      const otherPatientAccountBalanceBeforeWithdrawal =
        await otherPatient.getBalance()
      const otherPatientContractBalanceBeforeWithdrawal = (
        await gp.getPatient(otherPatient.address)
      ).balance

      const tx = await gp.connect(patient).withdrawPatientBalance()
      const txReceipt = await tx.wait(1)

      // Patient balance should be zero
      const { balance: patientBalance } = await gp
        .connect(deployer)
        .getPatient(patient.address)
      expect(patientBalance).to.equal(0)

      // Other patient balance should not change
      const { balance: otherPatientBalance } = await gp
        .connect(deployer)
        .getPatient(otherPatient.address)
      expect(otherPatientBalance).to.equal(
        otherPatientContractBalanceBeforeWithdrawal
      )
      expect(await otherPatient.getBalance()).to.equal(
        otherPatientAccountBalanceBeforeWithdrawal
      )

      // Correct amount should have been transferred
      const gasUsed = txReceipt.cumulativeGasUsed.mul(
        txReceipt.effectiveGasPrice
      )
      expect(await patient.getBalance()).to.equal(
        patientAccountBalanceBeforeWithdrawal
          .add(patientContractBalanceBeforeWithdrawal)
          .sub(gasUsed)
      )
    })

    it("should revert withdrawal when account is not patient", async () => {
      const tx = gp.connect(nonPatient).withdrawPatientBalance()
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyPatient__NotRegistered"
      )
    })

    it("should revert withdrawal when patient has zero balance", async () => {
      const tx = gp
        .connect(patientWithZeroContractBalance)
        .withdrawPatientBalance()
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__WithdrawPatientBalance__ZeroBalance"
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

  describe("getAdmin", () => {
    it("should return admin if requested by admin", async () => {
      const { active, name } = await gp.getAdmin(deployer.address)
      expect({ active, name }).to.deep.equal({
        active: true,
        name: "GP admin (Deployer)",
      })
    })

    it("should not return admin if requested by non-admin", async () => {
      const [, user1] = await ethers.getSigners()
      const tx = gp.connect(user1).getAdmin(deployer.address)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )
    })
  })

  describe("getDoctors", () => {
    let doctor: SignerWithAddress, user1: SignerWithAddress

    beforeEach(async () => {
      ;[, doctor, user1] = await ethers.getSigners()
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")
    })

    it("should return doctors if requested by admin", async () => {
      const doctors = await gp.connect(deployer.address).getDoctors()
      expect(doctors).to.have.length(1)
      expect(doctors).to.deep.equal([doctor.address])
    })

    it("should return doctors if requested by non-admin", async () => {
      const doctors = await gp.connect(user1).getDoctors()
      expect(doctors).to.deep.equal([doctor.address])
    })

    it("should return doctors if requested by a doctor", async () => {
      const doctors = await gp.connect(doctor).getDoctors()
      expect(doctors).to.deep.equal([doctor.address])
    })
  })

  describe("getDoctor", () => {
    let doctor: SignerWithAddress, user1: SignerWithAddress

    beforeEach(async () => {
      ;[, doctor, user1] = await ethers.getSigners()
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")
    })

    it("should return doctor if requested by admin", async () => {
      const { active, name, specialty } = await gp
        .connect(deployer)
        .getDoctor(doctor.address)
      expect({ active, name, specialty }).to.deep.equal({
        active: true,
        name: "Fredrick Simpson",
        specialty: "General",
      })
    })

    it("should return doctor if requested by non-admin", async () => {
      const { active, name, specialty } = await gp
        .connect(user1)
        .getDoctor(doctor.address)
      expect({ active, name, specialty }).to.deep.equal({
        active: true,
        name: "Fredrick Simpson",
        specialty: "General",
      })
    })

    it("should return doctor if requested by a doctor", async () => {
      const { active, name, specialty } = await gp
        .connect(doctor)
        .getDoctor(doctor.address)
      expect({ active, name, specialty }).to.deep.equal({
        active: true,
        name: "Fredrick Simpson",
        specialty: "General",
      })
    })
  })

  describe("getPatients", () => {
    let patient: SignerWithAddress,
      doctor: SignerWithAddress,
      user1: SignerWithAddress

    beforeEach(async () => {
      ;[, patient, doctor, user1] = await ethers.getSigners()
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")
      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )
    })

    it("should return patients if requested by admin", async () => {
      const patients = await gp.connect(deployer.address).getPatients()
      expect(patients).to.have.length(1)
      expect(patients).to.deep.equal([patient.address])
    })

    it("should not return patients if requested by non-admin", async () => {
      const tx = gp.connect(user1).getPatients()
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )
    })

    it("should not return patients if requested by a doctor", async () => {
      const tx = gp.connect(doctor).getPatients()
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )
    })

    it("should not return patients if requested by a patient", async () => {
      const tx = gp.connect(patient).getPatients()
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__OnlyAdmin__NotAnAdmin"
      )
    })
  })

  describe("getPatient", () => {
    let patient: SignerWithAddress,
      otherPatient: SignerWithAddress,
      doctor: SignerWithAddress,
      user1: SignerWithAddress

    beforeEach(async () => {
      ;[, patient, otherPatient, doctor, user1] = await ethers.getSigners()
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")
      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )
      await gp
        .connect(otherPatient)
        ["addPatient(string,uint256,uint8)"](
          "Felton Blackwell",
          getTime("1995-02-27"),
          Sex.Male
        )
    })

    it("should return patient if requested by admin", async () => {
      const { active, name, dateOfBirth, birthSex, balance } = await gp
        .connect(deployer.address)
        .getPatient(patient.address)
      expect({ active, name, dateOfBirth, birthSex, balance }).to.deep.equal({
        active: true,
        name: "Natalia Mayo",
        dateOfBirth: getTime("1990-06-12"),
        birthSex: Sex.Female,
        balance: 0,
      })
    })

    it("should return patient if requested by a doctor", async () => {
      const { active, name, dateOfBirth, birthSex, balance } = await gp
        .connect(doctor.address)
        .getPatient(patient.address)
      expect({ active, name, dateOfBirth, birthSex, balance }).to.deep.equal({
        active: true,
        name: "Natalia Mayo",
        dateOfBirth: getTime("1990-06-12"),
        birthSex: Sex.Female,
        balance: 0,
      })
    })

    it("should return patient if requested by the patient", async () => {
      const { active, name, dateOfBirth, birthSex, balance } = await gp
        .connect(patient.address)
        .getPatient(patient.address)
      expect({ active, name, dateOfBirth, birthSex, balance }).to.deep.equal({
        active: true,
        name: "Natalia Mayo",
        dateOfBirth: getTime("1990-06-12"),
        birthSex: Sex.Female,
        balance: 0,
      })
    })

    it("should not return patient if requested by non-admin", async () => {
      const tx = gp.connect(user1).getPatient(patient.address)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__GetPatient__NotAllowed"
      )
    })

    it("should not return patient if requested by another patient", async () => {
      const tx = gp.connect(otherPatient).getPatient(patient.address)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__GetPatient__NotAllowed"
      )
    })
  })

  describe("getBookings", () => {
    let patient: SignerWithAddress,
      doctor: SignerWithAddress,
      otherDoctor: SignerWithAddress,
      unregistered: SignerWithAddress,
      dateKey: string

    beforeEach(async () => {
      ;[, patient, doctor, otherDoctor, unregistered] =
        await ethers.getSigners()
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")
      await gp.addDoctor(otherDoctor.address, "Raleigh Stokes", "General")
      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )
      const date = new Date((await now()) + 60 * 60 * 1000) // 1 hour in the future
      dateKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(
        1,
        "0"
      )}-${String(date.getDate()).padStart(1, "0")}`
      const fee = ethers.utils.parseEther("0.001")
      await gp.addBooking(getTime(date), dateKey, doctor.address, fee)
      await gp.addBooking(getTime(date), dateKey, otherDoctor.address, fee)
    })

    it("should return bookings if requested by admin", async () => {
      const bookings = await gp.connect(deployer.address).getBookings(dateKey)
      expect(bookings).to.have.length(2)
      expect(bookings).to.deep.equal([0, 1])
    })

    it("should return bookings if requested by doctor", async () => {
      const bookings = await gp.connect(doctor.address).getBookings(dateKey)
      expect(bookings).to.have.length(2)
      expect(bookings).to.deep.equal([0, 1])
    })

    it("should return bookings if requested by patient", async () => {
      const bookings = await gp.connect(patient.address).getBookings(dateKey)
      expect(bookings).to.have.length(2)
      expect(bookings).to.deep.equal([0, 1])
    })

    it("should return bookings if requested by unregistered user", async () => {
      const bookings = await gp
        .connect(unregistered.address)
        .getBookings(dateKey)
      expect(bookings).to.have.length(2)
      expect(bookings).to.deep.equal([0, 1])
    })

    it("should return no bookings if there are no bookings for the specified date key", async () => {
      const bookings = await gp
        .connect(deployer.address)
        .getBookings("2022-01-05")
      expect(bookings).to.have.length(0)
    })
  })

  describe("getBooking", () => {
    let patient: SignerWithAddress,
      otherPatient: SignerWithAddress,
      doctor: SignerWithAddress,
      otherDoctor: SignerWithAddress,
      unregistered: SignerWithAddress,
      date: Date,
      dateKey: string

    beforeEach(async () => {
      ;[, patient, otherPatient, doctor, otherDoctor, unregistered] =
        await ethers.getSigners()
      await gp.addDoctor(doctor.address, "Fredrick Simpson", "General")
      await gp.addDoctor(otherDoctor.address, "Raleigh Stokes", "General")
      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )
      await gp
        .connect(otherPatient)
        ["addPatient(string,uint256,uint8)"](
          "Peter Davidson",
          getTime("1992-03-15"),
          Sex.Male
        )

      date = new Date((await now()) + 60 * 60 * 1000) // 1 hour in the future
      dateKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(
        1,
        "0"
      )}-${String(date.getDate()).padStart(1, "0")}`
      const fee = ethers.utils.parseEther("0.001")
      await gp.addBooking(getTime(date), dateKey, doctor.address, fee)
      await gp.connect(patient).book(0, "Requesting prescription", {
        value: fee,
      })
      await gp.connect(doctor).markBookingAsVisited(0, "Prescribed again")
    })

    it("should return booking if requested by admin", async () => {
      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      } = await gp.connect(deployer.address).getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(date),
        appointmentDateKey: dateKey,
        doctorAddress: doctor.address,
        patientAddress: patient.address,
        fee,
        status: BookingStatus.Visited,
      })
    })

    it("should return booking if requested by doctor", async () => {
      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      } = await gp.connect(doctor.address).getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(date),
        appointmentDateKey: dateKey,
        doctorAddress: doctor.address,
        patientAddress: patient.address,
        fee,
        status: BookingStatus.Visited,
      })
    })

    it("should return booking if requested by patient", async () => {
      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      } = await gp.connect(patient.address).getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(date),
        appointmentDateKey: dateKey,
        doctorAddress: doctor.address,
        patientAddress: patient.address,
        fee,
        status: BookingStatus.Visited,
      })
    })

    it("should not return sensitive data about the booking if requested by other doctor", async () => {
      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      } = await gp.connect(otherDoctor.address).getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(date),
        appointmentDateKey: dateKey,
        doctorAddress: doctor.address,
        patientAddress: 0,
        fee,
        status: BookingStatus.Booked,
      })
    })

    it("should not return booking's sensitive data if requested by other patient", async () => {
      const {
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      } = await gp.connect(otherPatient.address).getBooking(0)
      expect({
        active,
        appointmentDate,
        appointmentDateKey,
        doctorAddress,
        patientAddress,
        fee,
        status,
      }).to.deep.equal({
        active: true,
        appointmentDate: getTime(date),
        appointmentDateKey: dateKey,
        doctorAddress: doctor.address,
        patientAddress: 0,
        fee,
        status: BookingStatus.Booked,
      })
    })

    it("should revert if booking does not exist", async () => {
      const tx = gp.connect(deployer.address).getBooking(100)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__GetBooking__InvalidBooking"
      )
    })

    it("should revert if requested by unregistered account", async () => {
      const tx = gp.connect(unregistered.address).getBooking(0)
      await expect(tx).to.be.revertedWithCustomError(
        gp,
        "GP__GetBooking__NotRegistered"
      )
    })
  })

  describe("getNotes", () => {
    let patient: SignerWithAddress,
      otherPatient: SignerWithAddress,
      unregistered: SignerWithAddress
    beforeEach(async () => {
      ;[, patient, otherPatient, unregistered] = await ethers.getSigners()

      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )

      await gp
        .connect(otherPatient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )
    })

    it("should return notes when requested by account", async () => {
      const notes = await gp.getNotes(patient.address)
      expect(notes).to.have.length(1)
      expect(notes).to.deep.equal([0])
    })

    it("should return empty when requested by an unregistered account", async () => {
      const notes = await gp.getNotes(unregistered.address)
      expect(notes).to.have.length(0)
    })
  })

  describe("getNote", () => {
    let patient: SignerWithAddress,
      otherPatient: SignerWithAddress
    beforeEach(async () => {
      ;[, patient, otherPatient] = await ethers.getSigners()

      await gp
        .connect(patient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )

      await gp
        .connect(otherPatient)
        ["addPatient(string,uint256,uint8)"](
          "Natalia Mayo",
          getTime("1990-06-12"),
          Sex.Female
        )
    })

    it("should return note when requested by account", async () => {
      const note = await gp.connect(patient).getNote(0)
      expect(note.addedBy).to.equal(patient.address)
      expect(note.note).to.equal("Patient registered")
      expect(note.timestamp).to.be.greaterThan(0)
    })

    it("should revert when requested by an account that doesn't have access to the note", async () => {
      const tx = gp.connect(otherPatient).getNote(0)
      await expect(tx).to.be.revertedWithCustomError(gp, "GP__GetNote__NotAllowed")
    })
  })
})
