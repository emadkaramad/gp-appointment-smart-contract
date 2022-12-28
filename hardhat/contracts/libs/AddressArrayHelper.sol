// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library AddressArrayHelper {
    struct AddressArray {
        address[] _items;
    }

    function add(AddressArray storage thisArray, address value) internal {
        thisArray._items.push(value);
    }


    function remove(AddressArray storage thisArray, address valueToRemove) internal {
        uint256 arrayLength = thisArray._items.length;
        for(uint256 i = 0; i < arrayLength; i++) {
            if(thisArray._items[i] == valueToRemove) {
                thisArray._items[i] = thisArray._items[arrayLength - 1];
                thisArray._items.pop();
                break;
            }
        }
    }

    function get(AddressArray storage thisArray) internal view returns(address[] memory) {
        return thisArray._items;
    }
}
