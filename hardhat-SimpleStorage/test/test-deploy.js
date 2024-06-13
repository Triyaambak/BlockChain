const { ethers } = require("hardhat");
const { assert, expect } = require("chai");

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage;
    //beforeEach() s used to run before every tests/it()
    //Before we run the tests we need to create a simpleStorage contract
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await simpleStorageFactory.deploy();
    });

    //What should each test should do
    it("Should start with a favNum of 0", async function () {
        const favNum = await simpleStorage.retrieve();
        const expectedFavNum = 0;
        //We can use either expect/assert from the chai package

        //Checking if favNum and expectedFavNum are equal
        assert.equal(favNum.toString(), expectedFavNum);
    });

    it("Should update when we call store", async function () {
        const expectedValue = "69";

        //We are storing/updating the favNum
        const txRes = await simpleStorage.store("69");
        //Waiting for 1 tx confirmation
        await txRes.wait(1);

        const storedValue = await simpleStorage.retrieve();
        //Checking if the storedValue and expectedVal are equal
        assert.equal(storedValue.toString(), expectedValue);
    });

    //To only run a particular test
    //it.only()
});
