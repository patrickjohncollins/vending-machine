'use strict';

describe('myApp', function() {

	describe('vendingMachineView', function() {

		var elements;
	
		beforeEach(function() {
			browser.get('index.html');
			elements = {
				credit: element(by.id('credit')),
				status: element(by.id('status')),
				insert100: element(by.buttonText('€1')),
				insert050: element(by.buttonText('50c')),
				insert020: element(by.buttonText('20c')),
				insert010: element(by.buttonText('10c')),
				insert005: element(by.buttonText('5c')),
				slot1: element(by.buttonText('1')),
				slot2: element(by.buttonText('2')),
				slot5: element(by.buttonText('5')),
				slot6: element(by.buttonText('6')),
				change: element(by.buttonText('Change'))
			};
		});
		
		function expectCredit(expected) {
			expect(elements.credit.getAttribute('value')).toEqual(expected);
		}

		function expectStatus(expected) {
			expect(elements.status.getAttribute('value')).toEqual(expected);
		}

		it('should initialize correctly', function() {
			expectCredit('€0.00');
		});
		
		it('should not allow the purchase of an invalid product', function() {
			elements.slot6.click();
			expectStatus('Invalid');
		});
		
		it('should not allow a purchase from an empty slot', function() {
			elements.insert100.click();
			elements.slot2.click();
			expectStatus('Empty');
		});
		
		it('should not allow a purchase with insufficient credit', function() {
			elements.insert100.click();
			elements.slot5.click();
			expectStatus('€1.50');
		});
		
		it('should dispense coins normally', function() {		
			elements.insert050.click();
			elements.insert020.click();
			elements.insert010.click();
			expectCredit('€0.80');
			elements.change.click();
			expectCredit('€0.00');
		});

		it('should allow a normal purchase', function() {
			elements.insert100.click();
			elements.slot1.click();
			expectCredit('€0.20');
			elements.change.click();
			expectCredit('€0.00');
			expectStatus('Enjoy!');
		});
		
		it('should not allow 5c coins to be returned', function() {
			elements.insert005.click();
			expectCredit('€0.05');
			elements.change.click();
			expectCredit('€0.05');
			expectStatus('No Coin');
		});

	});

});
