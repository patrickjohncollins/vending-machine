'use strict';

angular.module('myApp', [])

.controller('vendingMachineController', ['$scope', '$interval', '$filter', 'vendingMachineIO', function($scope, $interval, $filter, vendingMachineIO) {

	$scope.credit = 0;
	$scope.status = "";
	$scope.slotPrices = vendingMachineIO.getSlotPrices();
	
	$scope.coinDenominations = [2, 1, 0.5, 0.2, 0.1, 0.05];

	// called by the machine when coins are accepted
	$scope.insertCoin = function(value) {
		incrementCredit(value);
	}

	// called when the user enters a selection on the keypad
	$scope.selectSlot = function(slot) {
		if (!isSlotValid(slot)) return;
		var price = getSlotPrice(slot);
		if (!hasSufficientCredit(price)) return;
		if (!dispenseProduct(slot)) return;
		decrementCredit(price);
		flashStatus("Enjoy!");
	}

	function isSlotValid(slot) {
		if (slot < $scope.slotPrices.length) return true;
		flashStatus("Invalid"); return false;
	}

	function getSlotPrice(slot) {
		return $scope.slotPrices[slot];
	}

	function hasSufficientCredit(price) {
		if ($scope.credit >= price) return true;
		flashPrice(price); return false; 
	}
	
	function dispenseProduct(slot) {
		if (vendingMachineIO.tryDispenseProduct(slot)) return true;
		flashStatus("Empty"); return false; 
	}
	
	// called when the user hits the change button
	$scope.dispenseChange = function() {
		$scope.coinDenominations.forEach(function(value) {
			while (dispenseCoin(value)) { };
		});
		if ($scope.credit > 0) flashStatus("No Coin"); // Unable to return all change
	}
	
	function dispenseCoin(value) {
		if (value > $scope.credit) return false; // Coin too big
		if (!vendingMachineIO.tryDispenseCoin(value)) return false; // No coins left
		decrementCredit(value); return true; // OK - coin dispensed
	}

	function incrementCredit(value) {
		$scope.credit += value;
		roundTwoDecimals();
	}
	
	function decrementCredit(value) {
		$scope.credit -= value;
		roundTwoDecimals();
	}
	
	function roundTwoDecimals() {
		// Round to two decimal places to avoid floating point weirdness.
		$scope.credit = Math.round($scope.credit * 100) / 100
	}
	
	function flashPrice(price) {
		flashStatus($filter('currency')(price, "€")); 
	}
	
	function flashStatus(message) {
		$scope.status = message;
		$interval(function() { $scope.status = ""; }, 1000, 1);
	}
	
}])

.factory('vendingMachineIO', function() {	
	return {
		getSlotPrices: function() {
			// todo : read slot prices from file
			return [0.8, 0.9, 1.2, 1, 1.5];
		},
		tryDispenseProduct: function(slot) {
			// todo : send message to machine to dispense product
			return (slot !== 1);
		},
		tryDispenseCoin: function(value) {
			// todo : send message to machine to dispense coin
			return (value !== 0.05);
		}
	};
});

