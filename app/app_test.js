'use strict';

describe('myApp', function() {

	beforeEach(module('myApp'));
	
	describe('vendingMachineController', function() {

		var scope;
		var coins;
		var products;

		beforeEach(inject(function($rootScope, $controller, $interval, $filter, vendingMachineIO) {
			scope = $rootScope.$new();
			$controller('vendingMachineController', {
				$scope: scope, 
				$interval: $interval,
				$filter: $filter,
				vendingMachineIO: simulateVendingMachineIO(vendingMachineIO)
			});
		}));
		
		function simulateVendingMachineIO(io) {
			simulateSlotPrices(io);
	        simulateCoinDispensing(io);
	        simulateProductDispensing(io);
	        return io;
		}
		
		function simulateSlotPrices(io) {
			spyOn(io, "getSlotPrices").andReturn([0.8, 0.9, 1.2, 1, 1.5]);
		}
		
		function simulateCoinDispensing(io) {
			coins = {
				canDispense: function(value) { return true; },
				dispensed: []
			};
	        spyOn(io, "tryDispenseCoin").andCallFake(function(value) {
	        	if (!coins.canDispense(value)) return false;
	        	coins.dispensed.push(value); return true;
			});
		}
		
		function simulateProductDispensing(io) {
			products = {
				canDispense: function(slot) { return true; },
				dispensed: []
			};
	        spyOn(io, "tryDispenseProduct").andCallFake(function(slot) {
	        	if (!products.canDispense(slot)) return false;
	        	products.dispensed.push(slot); return true;
			});
		}
			
		it('should initialize correctly', function() {		
			expect(scope.credit).toBe(0);
		});
		
		it('should not allow the purchase of an invalid product', function() {
			scope.selectSlot(5);
			expect(scope.status).toBe("Invalid");
		});

		it('should not allow a purchase from an empty slot', function() {
			scope.insertCoin(1);
			products.canDispense = function(slot) { 
				return (slot !== 1); // Disallow dispensing products from slot #1
			};
			scope.selectSlot(1);
			expect(scope.status).toBe("Empty");
		});
		
		it('should not allow a purchase with insufficient credit', function() {
			scope.insertCoin(1);
			scope.selectSlot(4);
			expect(scope.status).toBe("€1.50");
		});
		
		it('should dispense coins normally', function() {
			coins.inserted = [0.5, 0.2, 0.1];
			coins.inserted.forEach(scope.insertCoin);
			expect(scope.credit).toBe(0.8);
			scope.dispenseChange();
			expect(coins.dispensed.toString()).toBe(coins.inserted.toString());
			expect(scope.credit).toBe(0);
		});
		
		it('should allow a normal purchase', function() {
			insertCoinSelectFirstSlotAndDispenseChange();
			expect(coins.dispensed.toString()).toBe([0.2].toString());
			expect(scope.credit).toBe(0);
		});

		it('should allow a normal purchase, no 20c coins available', function() {
			coins.canDispense = function(value) { 
				return value !== 0.2; // Disallow dispensing 20c coins
			};
			insertCoinSelectFirstSlotAndDispenseChange();
			expect(coins.dispensed.toString()).toBe([0.1, 0.1].toString());
			expect(scope.credit).toBe(0);
		});
		
		it('should allow a normal purchase, no 20c, 10c and 5c coins available', function() {
			coins.canDispense = function(value) { 
				return value > 0.2; // Disallow dispensing 20c coins and smaller
			};
			insertCoinSelectFirstSlotAndDispenseChange();
			expect(coins.dispensed.length).toBe(0);
			expect(scope.credit).toBe(0.2);
			expect(scope.status).toBe("No Coin");
		});
		
		function insertCoinSelectFirstSlotAndDispenseChange() {
			scope.insertCoin(1);
			expect(scope.credit).toBe(1);
			scope.selectSlot(0);
			expect(scope.credit).toBe(0.2);
			scope.dispenseChange();
		}
				
	});

});



