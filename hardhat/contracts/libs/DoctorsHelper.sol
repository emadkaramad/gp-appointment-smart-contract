// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Types.sol";
import "./AddressArrayHelper.sol";

library DoctorsHelper {
    using AddressArrayHelper for AddressArrayHelper.AddressArray;

    struct Doctors {
        AddressArrayHelper.AddressArray _addresses;
        mapping(address => Doctor) _doctors;
    }

    function add(
        Doctors storage doctors,
        address doctorAddress,
        string memory name,
        string memory specialty
    ) internal {
        doctors._addresses.add(doctorAddress);
        doctors._doctors[doctorAddress] = Doctor({
            active: true,
            name: name,
            specialty: specialty
        });
    }

    function remove(Doctors storage doctors, address doctorAddress) internal {
        doctors._addresses.remove(doctorAddress);
        delete doctors._doctors[doctorAddress];
    }

    function update(
        Doctors storage doctors,
        address doctorAddress,
        Doctor memory doctor
    ) internal {
        doctors._doctors[doctorAddress] = doctor;
    }

    function get(
        Doctors storage doctors
    ) internal view returns (address[] memory) {
        return doctors._addresses.get();
    }

    function get(
        Doctors storage doctors,
        address doctorAddress
    ) internal view returns (Doctor memory) {
        return doctors._doctors[doctorAddress];
    }

    function exists(
        Doctors storage doctors,
        address doctorAddress
    ) internal view returns (bool) {
        return get(doctors, doctorAddress).active == true;
    }
}
