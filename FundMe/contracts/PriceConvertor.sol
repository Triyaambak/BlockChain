// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor{

     function getPrice() internal view returns(uint256){
        //Address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (,int price,,,) = priceFeed.latestRoundData();
        return uint256(price*1e18);
    }

    function getVersion() internal view returns (uint256){
        AggregatorV3Interface versionFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        return versionFeed.version();
    }

    function getConversionRate(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPriceUSD = getPrice();
        uint256 ethAmountUSD = (ethAmount * ethPriceUSD) / 1e18;
        return ethAmountUSD;
    }

}