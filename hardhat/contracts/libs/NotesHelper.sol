// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Types.sol";

library NotesHelper {
    struct Notes {
        Note[] _notes;
        mapping(address => uint256[]) _users;
    }

    function add(
        Notes storage notes,
        string memory note,
        address addedBy
    ) internal {
        add(notes, note, addedBy, address(0));
    }

    function add(
        Notes storage notes,
        string memory note,
        address addedBy,
        address patientAddress
    ) internal {
        notes._notes.push(Note({
            note: note,
            timestamp: block.timestamp,
            addedBy: addedBy,
            patientAddress: patientAddress
        }));
        uint256 noteId = notes._notes.length - 1;
        notes._users[addedBy].push(noteId);

        if (patientAddress != address(0)) {
            notes._users[patientAddress].push(noteId);
        }
    }

    function get(Notes storage notes, address userAddress) internal view returns(uint256[] memory) {
        return notes._users[userAddress];
    }

    function get(Notes storage notes, uint256 noteId) internal view returns(Note memory) {
        return notes._notes[noteId];
    }
}
