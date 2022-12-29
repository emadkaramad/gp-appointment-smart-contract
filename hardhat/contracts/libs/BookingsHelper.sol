// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Types.sol";
import "./IndexArrayHelper.sol";

library BookingsHelper {
    using IndexArrayHelper for IndexArrayHelper.IndexArray;

    struct Bookings {
        Booking[] bookings;
        mapping(address => IndexArrayHelper.IndexArray) doctorsBookings;
        mapping(address => IndexArrayHelper.IndexArray) patientsBookings;
        mapping(string => IndexArrayHelper.IndexArray) byDate;
    }

    function add(
        Bookings storage bookings,
        uint256 date,
        string memory dateKey,
        address doctorAddress,
        uint256 fee
    ) internal {
        Booking memory booking = Booking({
            active: true,
            status: BookingStatus.Available,
            fee: fee,
            appointmentDate: date,
            appointmentDateKey: dateKey,
            patientAddress: address(0),
            doctorAddress: doctorAddress,
            patientNote: ""
        });

        bookings.bookings.push(booking);
        uint256 bookingId = bookings.bookings.length - 1;
        bookings.doctorsBookings[doctorAddress].add(bookingId);
        bookings.byDate[dateKey].add(bookingId);
    }

    function remove(Bookings storage bookings, uint256 bookingId) internal {
        Booking memory booking = bookings.bookings[bookingId];
        bookings.doctorsBookings[booking.doctorAddress].remove(bookingId);
        if (booking.patientAddress != address(0)) {
            bookings.patientsBookings[booking.doctorAddress].remove(bookingId);
        }
        bookings.byDate[booking.appointmentDateKey].remove(bookingId);
        delete bookings.bookings[bookingId];
    }

    function book(
        Bookings storage bookings,
        uint256 index,
        address patientAddress,
        string memory note
    ) internal {
        bookings.bookings[index].patientAddress = patientAddress;
        bookings.bookings[index].patientNote = note;
        bookings.bookings[index].status = BookingStatus.Booked;
        bookings.patientsBookings[patientAddress].add(index);
    }

    function cancel(Bookings storage bookings, uint256 index) internal {
        address patientAddress = bookings.bookings[index].patientAddress;
        bookings.patientsBookings[patientAddress].remove(index);
        bookings.bookings[index].patientAddress = address(0);
        bookings.bookings[index].patientNote = "";
        bookings.bookings[index].status = BookingStatus.Available;
    }

    function isAvailable(
        Bookings storage bookings,
        uint256 bookingId
    ) internal view returns (bool) {
        Booking memory booking = get(bookings, bookingId);
        return
            booking.appointmentDate > block.timestamp &&
            booking.status == BookingStatus.Available;
    }

    function isBookedAndAwaitingVisit(
        Bookings storage bookings,
        uint256 bookingId
    ) internal view returns (bool) {
        Booking memory booking = get(bookings, bookingId);
        return
            booking.appointmentDate > block.timestamp &&
            booking.status == BookingStatus.Booked;
    }

    function get(
        Bookings storage bookings,
        uint256 bookingId
    ) internal view returns (Booking memory) {
        return bookings.bookings[bookingId];
    }

    function getByDate(
        Bookings storage bookings,
        string calldata dateKey
    ) internal view returns (uint256[] memory) {
        return bookings.byDate[dateKey].get();
    }

    function exists(
        Bookings storage bookings,
        uint256 bookingId
    ) internal view returns (bool) {
        if(bookingId < 0 || bookingId > bookings.bookings.length) {
            return false;
        }

        return get(bookings, bookingId).active == true;
    }
}
