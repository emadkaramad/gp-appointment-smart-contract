// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

library IndexArrayHelper {
    struct IndexArray {
        uint256[] _items;
    }

    function add(IndexArray storage thisArray, uint256 value) internal {
        thisArray._items.push(value);
    }


    function remove(IndexArray storage thisArray, uint256 valueToRemove) internal {
        uint256 arrayLength = thisArray._items.length;
        for(uint256 i = 0; i < arrayLength; i++) {
            if(thisArray._items[i] == valueToRemove) {
                thisArray._items[i] = thisArray._items[arrayLength - 1];
                thisArray._items.pop();
                break;
            }
        }
    }

    function get(IndexArray storage thisArray) internal view returns(uint256[] memory) {
        return thisArray._items;
    }
}
