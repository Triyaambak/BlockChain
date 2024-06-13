// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "./PriceConvertor.sol";

error NotOwner();

contract FundMe{

    using PriceConvertor for uint256;

    uint256 public constant MINUSD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmount;
    address public immutable i_owner;

    constructor(){
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable{
        require(msg.value.getConversionRate() >= MINUSD , "Not Enough Ethereum");
        funders.push(msg.sender);
        addressToAmount[msg.sender] += msg.value;
    }
    
    function withdraw() public onlyOwner {
        for(uint256 i=0;i<funders.length;i++){
            address funder = funders[i];
            addressToAmount[funder] = 0;
        }

        funders = new address[](0);

        (bool success,) = payable(msg.sender).call{value :address(this).balance}("");
        require(success,"Withdraw failed");
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner,"Sender is not Owner");
        if(msg.sender != i_owner){
            revert NotOwner();
        }
        _;
    }

}