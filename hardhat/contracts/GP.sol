// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./libs/Types.sol";
import "./libs/Errors.sol";
import "./libs/BookingsHelper.sol";
import "./libs/AdminsHelper.sol";
import "./libs/DoctorsHelper.sol";
import "./libs/PatientsHelper.sol";
import "./libs/NotesHelper.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GP {
    using BookingsHelper for BookingsHelper.Bookings;
    using AdminsHelper for AdminsHelper.Admins;
    using DoctorsHelper for DoctorsHelper.Doctors;
    using PatientsHelper for PatientsHelper.Patients;
    using NotesHelper for NotesHelper.Notes;

    event AppointmentBooked(uint256, address, uint256);
    event AppointmentCancelled(uint256, address, uint256);

    string public name;

    AdminsHelper.Admins private admins;
    DoctorsHelper.Doctors private doctors;
    PatientsHelper.Patients private patients;
    BookingsHelper.Bookings private bookings;
    NotesHelper.Notes private notes;

    uint16 private constant GP_CANCELLATION_PERCENTAGE = 110;
    uint16 private constant PATIENT_CANCELLATION_MORE_THAN_24H_PERCENTAGE = 100;
    uint16 private constant PATIENT_CANCELLATION_LESS_THAN_24H_PERCENTAGE = 50;
    uint16 private constant PATIENT_CANCELLATION_LESS_THAN_2H_PERCENTAGE = 0;

    constructor(string memory gpName, string memory adminName) {
        name = gpName;
        admins.add(msg.sender, adminName);
    }

    //
    //
    // Public functions
    //
    //

    function addAdmin(
        address adminAddress,
        string calldata adminName
    ) public onlyAdmin {
        admins.add(adminAddress, adminName);
    }

    function addDoctor(
        address doctorAddress,
        string calldata doctorName,
        string calldata specialty
    ) public onlyAdmin {
        doctors.add(doctorAddress, doctorName, specialty);
    }

    function addPatient(
        address patientAddress,
        string calldata patientName,
        uint256 dateOfBirth,
        Sex birthSex
    ) public onlyAdmin {
        _addPatient(patientAddress, patientName, dateOfBirth, birthSex);
    }

    function addPatient(
        string calldata patientName,
        uint256 dateOfBirth,
        Sex birthSex
    ) public {
        _addPatient(msg.sender, patientName, dateOfBirth, birthSex);
    }

    function book(
        uint256 bookingId,
        string calldata note
    ) external payable onlyPatient {
        _book(bookingId, msg.sender, note);
    }

    function cancelBooking(uint256 bookingId) external {
        _cancelBooking(bookingId, msg.sender);
    }

    function withdrawPatientBalance() external onlyPatient {
        _withdrawPatientBalance(msg.sender);
    }

    function getAdmins() public view onlyAdmin returns (address[] memory) {
        return admins.get();
    }

    function getAdmin(
        address adminAddress
    ) public view onlyAdmin returns (Admin memory) {
        return admins.get(adminAddress);
    }

    function getPatients() public view onlyAdmin returns (address[] memory) {
        return patients.get();
    }

    function getPatient(
        address patientAddress
    ) public view onlyAdmin returns (Patient memory) {
        return patients.get(patientAddress);
    }

    function getDoctors() public view returns (address[] memory) {
        return doctors.get();
    }

    function getDoctor(
        address doctorAddress
    ) public view returns (Doctor memory) {
        return doctors.get(doctorAddress);
    }

    //
    //
    // Private functions
    //
    //

    function _addPatient(
        address patientAddress,
        string calldata patientName,
        uint256 dateOfBirth,
        Sex birthSex
    ) private {
        if (patients.exists(patientAddress)) {
            revert GP__AddPatient__AlreadyRegistered();
        }

        patients.add(patientAddress, patientName, dateOfBirth, birthSex);
        notes.add("Patient registered", msg.sender, patientAddress);
    }

    function _book(
        uint256 bookingId,
        address patientAddress,
        string calldata note
    ) private {
        if (bookings.exists(bookingId) == false) {
            revert GP__Book__InvalidBooking();
        }

        if (!bookings.isAvailable(bookingId)) {
            revert GP__Book__NotAvailable();
        }

        if (msg.value < bookings.get(bookingId).fee) {
            revert GP__Book__InvalidFeePaid();
        }

        bookings.book(bookingId, patientAddress, note);
        Booking memory booking = bookings.get(bookingId);

        emit AppointmentBooked(
            bookingId,
            booking.doctorAddress,
            booking.appointmentDate
        );
    }

    function _calculateRefundAmount(
        uint256 fee,
        uint16 percentage
    ) private pure returns (uint256) {
        return (fee * percentage) / 100;
    }

    function _cancelBooking(uint256 bookingId, address cancelBy) private {
        if (bookings.exists(bookingId) == false) {
            revert GP__CancelBooking__InvalidBooking();
        }

        if (bookings.isBookedAndAwaitingVisit(bookingId)) {
            revert GP__CancelBooking__NotAvailable();
        }

        Booking memory booking = bookings.get(bookingId);
        bookings.cancel(bookingId);

        uint16 refundPercentage;
        if (_isAdmin(cancelBy)) {
            refundPercentage = GP_CANCELLATION_PERCENTAGE;
        } else if (booking.patientAddress == cancelBy) {
            if (block.timestamp < block.timestamp - 2 hours) {
                refundPercentage = PATIENT_CANCELLATION_LESS_THAN_2H_PERCENTAGE;
            } else if (block.timestamp < block.timestamp - 24 hours) {
                refundPercentage = PATIENT_CANCELLATION_LESS_THAN_24H_PERCENTAGE;
            } else {
                refundPercentage = PATIENT_CANCELLATION_MORE_THAN_24H_PERCENTAGE;
            }
        }

        if (refundPercentage > 0) {
            uint256 refundAmount = _calculateRefundAmount(
                booking.fee,
                refundPercentage
            );
            patients.increaseBalance(booking.patientAddress, refundAmount);
            notes.add(
                string.concat("Refunded amount: ", Strings.toString(refundAmount)),
                cancelBy,
                booking.patientAddress
            );
        }

        emit AppointmentCancelled(
            bookingId,
            booking.doctorAddress,
            booking.appointmentDate
        );
    }

    function _withdrawPatientBalance(address patientAddress) private {
        uint256 patientBalance = patients.get(patientAddress).balance;
        if (patientBalance <= 0) {
            revert GP__WithdrawPatientBalance__ZeroBalance();
        }

        patients.decreaseBalance(patientAddress, patientBalance);

        (bool refunded, ) = payable(patientAddress).call{value: patientBalance}("");
        if (refunded == false) {
            revert GP__WithdrawPatientBalance__RefundFailed();
        }
    }

    function _isAdmin(address adminAddress) private view returns (bool) {
        return admins.exists(adminAddress);
    }

    //
    //
    // Modifiers
    //
    //

    modifier onlyAdmin() {
        if (_isAdmin(msg.sender) == false) {
            revert GP__OnlyAdmin__NotAnAdmin();
        }
        _;
    }

    modifier onlyPatient() {
        if (patients.exists(msg.sender) == false) {
            revert GP__OnlyPatient__NotRegistered();
        }
        _;
    }
}
