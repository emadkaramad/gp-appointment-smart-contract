// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IndexArrayHelper.sol";

enum Sex {
    Male,
    Female
}

enum BookingStatus {
    Available,
    Booked,
    Visited,
    NoShowUp
}

struct Admin {
    bool active;
    string name;
}

struct Doctor {
    bool active;
    string name;
    string specialty;
}

struct Note {
    string note;
    uint256 timestamp;
    address addedBy;
    address patientAddress;
}

struct Patient {
    bool active;
    string name;
    uint256 dateOfBirth;
    Sex birthSex;
    uint256 balance;
}

struct Booking {
    bool active;
    address doctorAddress;
    address patientAddress;
    string patientNote;
    uint256 fee;
    uint256 appointmentDate;
    string appointmentDateKey;
    BookingStatus status;
}
