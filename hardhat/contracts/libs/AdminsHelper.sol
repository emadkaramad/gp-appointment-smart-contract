// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Types.sol";
import "./AddressArrayHelper.sol";

library AdminsHelper {
    using AddressArrayHelper for AddressArrayHelper.AddressArray;

    struct Admins {
        AddressArrayHelper.AddressArray _addresses;
        mapping(address => Admin) _admins;
    }

    function add(
        Admins storage admins,
        address adminAddress,
        string memory name
    ) internal {
        admins._addresses.add(adminAddress);
        admins._admins[adminAddress] = Admin({active: true, name: name});
    }

    function remove(Admins storage admins, address adminAddress) internal {
        admins._addresses.remove(adminAddress);
        delete admins._admins[adminAddress];
    }

    function update(
        Admins storage admins,
        address adminAddress,
        Admin memory admin
    ) internal {
        admins._admins[adminAddress] = admin;
    }

    function get(
        Admins storage admins
    ) internal view returns (address[] memory) {
        return admins._addresses.get();
    }

    function get(
        Admins storage admins,
        address adminAddress
    ) internal view returns (Admin memory) {
        return admins._admins[adminAddress];
    }

    function exists(
        Admins storage admins,
        address adminAddress
    ) internal view returns (bool) {
        return get(admins, adminAddress).active == true;
    }
}
