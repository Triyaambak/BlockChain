// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "./PriceConverter.sol";

//Errors
error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Triyaambak S
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our libraries
 */
contract FundMe {
    //Type declarations
    using PriceConvertor for uint256;

    //State variables
    uint256 public constant MINUSD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmount;
    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner,"Sender is not Owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINUSD,
            "Not Enough Ethereum"
        );
        funders.push(msg.sender);
        addressToAmount[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmount[funder] = 0;
        }

        funders = new address[](0);

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Withdraw failed");
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    function addressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return addressToAmount[funder];
    }

    function getFunder() public view returns (address) {
        return funders[funders.length - 1];
    }
}
