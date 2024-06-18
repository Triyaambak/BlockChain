// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "./PriceConverter.sol";

//Errors
error FundMe__NotOwner();
error FundMe__NotEnoughEth();
error FundMe__WithdrawFailed();

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
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmount;
    address private immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner,"Sender is not Owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if (msg.value.getConversionRate(s_priceFeed) <= MINUSD) {
            revert FundMe__NotEnoughEth();
        }
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] += msg.value;
    }

    /*
        This withdraw function takes a ton of gas and hence is optimized
        function withdraw() public onlyOwner {
            for (uint256 i = 0; i < s_funders.length; i++) {
                address funder = s_funders[i];
                s_addressToAmount[funder] = 0;
            }

            s_funders = new address[](0);

            (bool success, ) = payable(msg.sender).call{
                value: address(this).balance
            }("");
            require(success, "Withdraw failed");
        }
    */

    function withdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            s_addressToAmount[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (success != true) {
            revert FundMe__WithdrawFailed();
        }
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function addressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmount[funder];
    }

    function getFunder() public view returns (address) {
        return s_funders[s_funders.length - 1];
    }
}
