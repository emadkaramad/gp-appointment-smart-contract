// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Types.sol";

library NotesHelper {
    struct Notes {
        Note[] _notes;
        mapping(address => uint256[]) _users;
        mapping(uint256 => uint256[]) _bookings;
    }

    function add(
        Notes storage notes,
        string memory note,
        address addedBy,
        address patientAddress
    ) internal returns(uint256) {
        notes._notes.push(
            Note({note: note, timestamp: block.timestamp, addedBy: addedBy})
        );
        uint256 noteId = notes._notes.length - 1;
        notes._users[addedBy].push(noteId);
        notes._users[patientAddress].push(noteId);

        return noteId;
    }

    function add(
        Notes storage notes,
        string memory note,
        address addedBy,
        address patientAddress,
        uint256 bookingId
    ) internal returns(uint256) {
        uint256 noteId = add(notes, note, addedBy, patientAddress);
        notes._bookings[bookingId].push(noteId);

        return noteId;
    }

    function get(
        Notes storage notes,
        address userAddress
    ) internal view returns (uint256[] memory) {
        return notes._users[userAddress];
    }

    function get(
        Notes storage notes,
        uint256 noteId
    ) internal view returns (Note memory) {
        return notes._notes[noteId];
    }
}
