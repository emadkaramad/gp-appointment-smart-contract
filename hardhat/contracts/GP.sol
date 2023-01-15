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

    event AppointmentBooked(
        uint256 indexed bookingId,
        address indexed doctorAddress,
        uint256 indexed appointmentDate
    );
    event AppointmentCancelled(
        uint256 indexed bookingId,
        address indexed doctorAddress,
        uint256 indexed appointmentDate
    );

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

    constructor(string memory gpName, string memory adminName) payable {
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
    ) external onlyAdmin {
        admins.add(adminAddress, adminName);
    }

    function addDoctor(
        address doctorAddress,
        string calldata doctorName,
        string calldata specialty
    ) external onlyAdmin {
        doctors.add(doctorAddress, doctorName, specialty);
    }

    function addPatient(
        address patientAddress,
        string calldata patientName,
        uint256 dateOfBirth,
        Sex birthSex
    ) external onlyAdmin {
        _addPatient(patientAddress, patientName, dateOfBirth, birthSex);
    }

    function addPatient(
        string calldata patientName,
        uint256 dateOfBirth,
        Sex birthSex
    ) external {
        _addPatient(msg.sender, patientName, dateOfBirth, birthSex);
    }

    function addBooking(
        uint256 date,
        string memory dateKey,
        address doctorAddress,
        uint256 fee
    ) external onlyAdmin {
        bookings.add(date, dateKey, doctorAddress, fee);
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

    function markBookingAsNoShowUp(
        uint256 bookingId
    ) external onlyDoctor(bookingId) {
        bookings.markAsNoShowUp(bookingId);
    }

    function markBookingAsVisited(
        uint256 bookingId,
        string memory note
    ) external onlyDoctor(bookingId) {
        bookings.markAsVisited(bookingId);
        Booking memory booking = bookings.get(bookingId);
        notes.add(note, msg.sender, booking.patientAddress, bookingId);
    }

    function getAdmins() external view onlyAdmin returns (address[] memory) {
        return admins.get();
    }

    function getAdmin(
        address adminAddress
    ) external view onlyAdmin returns (Admin memory) {
        return admins.get(adminAddress);
    }

    function getPatients() external view onlyAdmin returns (address[] memory) {
        return patients.get();
    }

    function getPatient(
        address patientAddress
    ) external view returns (Patient memory) {
        if (
            _isAdmin(msg.sender) ||
            _isDoctor(msg.sender) ||
            msg.sender == patientAddress
        ) {
            return patients.get(patientAddress);
        }

        revert GP__GetPatient__NotAllowed();
    }

    function getDoctors() external view returns (address[] memory) {
        return doctors.get();
    }

    function getDoctor(
        address doctorAddress
    ) external view returns (Doctor memory) {
        return doctors.get(doctorAddress);
    }

    function getBookings(
        string calldata dateKey
    ) external view returns (uint256[] memory) {
        return bookings.getByDate(dateKey);
    }

    function getBooking(
        uint256 bookingId
    ) external view returns (Booking memory) {
        return _getBooking(bookingId);
    }

    function getNotes(
        address userAddress
    ) external view returns (uint256[] memory) {
        return notes.get(userAddress);
    }

    function getNote(uint256 noteId) external view returns (Note memory) {
        if (notes.hasAccess(noteId, msg.sender)) {
            return notes.get(noteId);
        }

        revert GP__GetNote__NotAllowed();
    }

    // To allow funding the contract
    receive() external payable {}

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

        Booking memory booking = bookings.get(bookingId);

        if (msg.value < booking.fee) {
            revert GP__Book__InvalidFeePaid();
        }

        bookings.book(bookingId, patientAddress);
        notes.add(note, msg.sender, patientAddress);

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

        if (bookings.isBookedAndAwaitingVisit(bookingId) == false) {
            revert GP__CancelBooking__NotAvailable();
        }

        Booking memory booking = bookings.get(bookingId);

        if (
            _isAdmin(msg.sender) == false &&
            booking.patientAddress != msg.sender
        ) {
            revert GP__CancelBooking__NotAllowed();
        }

        bookings.cancel(bookingId);

        uint16 refundPercentage;
        if (_isAdmin(cancelBy)) {
            refundPercentage = GP_CANCELLATION_PERCENTAGE;
        } else if (booking.patientAddress == cancelBy) {
            if (block.timestamp > booking.appointmentDate - 2 hours) {
                refundPercentage = PATIENT_CANCELLATION_LESS_THAN_2H_PERCENTAGE;
            } else if (block.timestamp > booking.appointmentDate - 24 hours) {
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
                string.concat(
                    "Refunded amount: ",
                    Strings.toString(refundAmount)
                ),
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

        (bool refunded, ) = payable(patientAddress).call{value: patientBalance}(
            ""
        );
        if (refunded == false) {
            revert GP__WithdrawPatientBalance__TransactionFailed();
        }
    }

    function _isAdmin(address adminAddress) private view returns (bool) {
        return admins.exists(adminAddress);
    }

    function _isDoctor(address doctorAddress) private view returns (bool) {
        return doctors.exists(doctorAddress);
    }

    function _getBooking(
        uint256 bookingId
    ) private view returns (Booking memory) {
        if (bookings.exists(bookingId) == false) {
            revert GP__GetBooking__InvalidBooking();
        }

        Booking memory booking = bookings.get(bookingId);
        if (
            _isAdmin(msg.sender) ||
            booking.patientAddress == msg.sender ||
            booking.doctorAddress == msg.sender
        ) {
            return booking;
        }

        if (
            patients.exists(msg.sender) == false &&
            doctors.exists(msg.sender) == false
        ) {
            revert GP__GetBooking__NotRegistered();
        }

        // Remove patient details
        delete booking.patientAddress;
        if (booking.status != BookingStatus.Available) {
            booking.status = BookingStatus.Booked;
        }
        return booking;
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

    modifier onlyDoctor(uint256 bookingId) {
        if (bookings.exists(bookingId) == false) {
            revert GP__OnlyDoctor__InvalidBooking();
        }

        if (bookings.get(bookingId).doctorAddress != msg.sender) {
            // Since booking info is publicly accessible, it is fine to say the account is not the doctor
            revert GP__OnlyDoctor__NotTheDoctor();
        }
        _;
    }
}
