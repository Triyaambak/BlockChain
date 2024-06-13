//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;
import "./SimpleStorage.sol";

contract StorageFactory{

    SimpleStorage[] public simpleStorageArray;

    function createSimpleStorageContract() public {
        SimpleStorage simplestorage = new SimpleStorage();
        simpleStorageArray.push(simplestorage);
    }

    function sfStore(uint256 simpleStorageIndex , uint256 simpleStorageNumber) public {
        SimpleStorage simplestorage = simpleStorageArray[simpleStorageIndex];
        simplestorage.store(simpleStorageNumber);
    }

    function sfGet(uint256 simpleStorageIndex) public view returns(uint256){
        SimpleStorage simplestorage = simpleStorageArray[simpleStorageIndex];
        return simplestorage.retrieve();
    }
}