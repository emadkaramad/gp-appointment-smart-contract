// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Types.sol";
import "./AddressArrayHelper.sol";

library PatientsHelper {
    using AddressArrayHelper for AddressArrayHelper.AddressArray;

    struct Patients {
        AddressArrayHelper.AddressArray _addresses;
        mapping(address => Patient) _patients;
    }

    function add(
        Patients storage patients,
        address patientAddress,
        string memory name,
        uint256 dateOfBirth,
        Sex birthSex
    ) internal {
        patients._addresses.add(patientAddress);
        patients._patients[patientAddress] = Patient({
            active: true,
            name: name,
            dateOfBirth: dateOfBirth,
            birthSex: birthSex,
            balance: 0
        });
    }

    function remove(
        Patients storage patients,
        address patientAddress
    ) internal {
        patients._addresses.remove(patientAddress);
        delete patients._patients[patientAddress];
    }

    function increaseBalance(
                Patients storage patients,
        address patientAddress,
        uint256 amount
    ) internal {
        patients._patients[patientAddress].balance += amount;
    }

    function decreaseBalance(
                Patients storage patients,
        address patientAddress,
        uint256 amount
    ) internal returns(bool) {
        if(patients._patients[patientAddress].balance < amount) {
            return false;
        }

        patients._patients[patientAddress].balance -= amount;
        return true;
    }

    function update(
        Patients storage patients,
        address patientAddress,
        string memory name,
        uint256 dateOfBirth,
        Sex birthSex
    ) internal {
        patients._patients[patientAddress].name = name;
        patients._patients[patientAddress].dateOfBirth = dateOfBirth;
        patients._patients[patientAddress].birthSex = birthSex;
    }

    function get(
        Patients storage patients
    ) internal view returns (address[] memory) {
        return patients._addresses.get();
    }

    function get(
        Patients storage patients,
        address patientAddress
    ) internal view returns (Patient memory) {
        return patients._patients[patientAddress];
    }

    function exists(
        Patients storage patients,
        address patientAddress
    ) internal view returns (bool) {
        return get(patients, patientAddress).active == true;
    }
}
