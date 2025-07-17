import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ConversionForm } from './conversion-form';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormGroup } from '@angular/forms';
import { mockCurrencies } from '../_mocks/currency.mock';
import { of } from 'rxjs';
import jasmine from 'jasmine';
import { currencyPayloadMock } from '../_mocks/currencyPayload.mock';
import { baseRateMock } from '../_mocks/baseRate.mock';
import { formatCurrency } from '@angular/common';

describe('ConversionForm', () => {
  let component: ConversionForm;
  let fixture: ComponentFixture<ConversionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversionForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createForm()', () => {
    it('creates the conversion form', () => {
      component.conversionForm = new UntypedFormGroup({});
      component['createForm']();

      expect(component.conversionForm.controls['fromValue']).toBeTruthy();
      expect(component.conversionForm.controls['fromCurrency']).toBeTruthy();
      expect(component.conversionForm.controls['toValue']).toBeTruthy();
      expect(component.conversionForm.controls['toCurrency']).toBeTruthy();
    });

    it('adds the required subscriptions', () => {
      const currenciesSpy = spyOn<any, string>(
        component,
        'subscribeToCurrencies'
      ).and.callFake(() => {});
      const newValueSpy = spyOn<any, string>(
        component,
        'subscribeToNewToValue'
      ).and.callFake(() => {});

      component['createForm']();
      expect(currenciesSpy).toHaveBeenCalled();
      expect(newValueSpy).toHaveBeenCalled();
    });
  });

  describe('subscribeToCurrencies()', () => {
    beforeEach(() => {
      spyOn(component['conversionService'], 'getCurrencies').and.returnValue(
        of(mockCurrencies)
      );
    });
    it('sets the currencies value', fakeAsync(() => {
      component['subscribeToCurrencies']();
      expect(component.currencies).toEqual(mockCurrencies);
    }));

    it('calls the required methods', () => {
      const applyDefaultsSpy = spyOn<any, string>(
        component,
        'applyDefaults'
      ).and.callFake(() => {});
      const subscribeToChangesSpy = spyOn<any, string>(
        component,
        'subscribeToChanges'
      ).and.callFake(() => {});
      component['subscribeToCurrencies']();
      expect(applyDefaultsSpy).toHaveBeenCalled();
      expect(subscribeToChangesSpy).toHaveBeenCalled();
    });
  });

  describe('applyDefaults()', () => {
    it('sets the two defaults correctly', () => {
      component['applyDefaults']();
      expect(component.conversionForm.controls['fromCurrency'].value).toEqual(
        component['defaultFromCurrencyCode']
      );

      expect(component.conversionForm.controls['toCurrency'].value).toEqual(
        component['defaultToCurrencyCode']
      );
    });
  });

  describe('susbcribeToChanges()', () => {
    let updateConversionSpy: jasmine.Spy;
    let getConversionRateSpy: jasmine.Spy;
    beforeEach(() => {
      updateConversionSpy = spyOn<any, string>(component, 'updateConversion');
      getConversionRateSpy = spyOn<any, string>(component, 'getConversionRate');
    });
    it('calls updateConversion with the correct values when it changes', fakeAsync(() => {
      component['subscribeToChanges']();
      component.conversionForm.controls['fromCurrency'].patchValue('ABC');
      component.conversionForm.controls['toCurrency'].patchValue('XYZ');
      component.conversionForm.controls['fromValue'].patchValue(10);

      tick(300);
      expect(updateConversionSpy).toHaveBeenCalledWith({
        fromCurrency: 'ABC',
        toCurrency: 'XYZ',
        fromValue: 10,
      });

      expect(getConversionRateSpy).toHaveBeenCalled();
    }));
  });

  describe('subscribeToNewValue()', () => {
    let updateConversionSpy: jasmine.Spy;
    beforeEach(() => {
      updateConversionSpy = spyOn<any, string>(component, 'updateConversion');
    });
    it('calls updateConversion with the correct value when toValue changes', fakeAsync(() => {
      component['subscribeToNewToValue']();
      component.conversionForm.controls['toValue'].patchValue(123);

      tick(300);
      expect(updateConversionSpy).toHaveBeenCalledWith(
        {
          fromCurrency: null,
          toCurrency: null,
          fromValue: 123,
        },
        true
      );
    }));
  });

  describe('updateConversion()', () => {
    it('calls convertCurrency()', () => {
      const spy = spyOn(
        component['conversionService'],
        'convertCurrency'
      ).and.returnValue(of(2));
      component['updateConversion'](currencyPayloadMock);
      expect(spy).toHaveBeenCalled();
    });

    it('updated the fromValue when toValueUpdated is true', fakeAsync(() => {
      const expectedValue: number = 2;
      const spy = spyOn(
        component['conversionService'],
        'convertCurrency'
      ).and.returnValue(of(expectedValue));
      component.conversionForm.patchValue({ fromValue: 10, toValue: 10 });
      component['updateConversion'](currencyPayloadMock, true);
      tick();

      expect(component.conversionForm.controls['fromValue'].value).toEqual(
        expectedValue.toFixed(2)
      );
      expect(component.conversionForm.controls['toValue'].value).toEqual(10);
    }));

    it('updated the toValue when toValueUpdated is false', fakeAsync(() => {
      const expectedValue: number = 9;
      const spy = spyOn(
        component['conversionService'],
        'convertCurrency'
      ).and.returnValue(of(expectedValue));
      component.conversionForm.patchValue({ fromValue: 10, toValue: 10 });
      component['updateConversion'](currencyPayloadMock, false);
      tick();

      expect(component.conversionForm.controls['fromValue'].value).toEqual(10);

      expect(component.conversionForm.controls['toValue'].value).toEqual(
        expectedValue.toFixed(2)
      );
    }));
  });

  describe('getConversionRate()', () => {
    it('gets and sets the base rate, selectedTo and selectedFrom', fakeAsync(() => {
      component.currencies = mockCurrencies;
      component.conversionForm.patchValue({
        fromCurrency: 'GBP',
        toCurrency: 'USD',
      });

      const spy = spyOn(
        component['conversionService'],
        'getLatestRate'
      ).and.returnValue(of(baseRateMock));

      component['getConversionRate']();

      expect(component.baseRate).toEqual(baseRateMock.rates['USD'].toFixed(2));
      expect(component.selectedFrom).toEqual(mockCurrencies[1].name);
      expect(component.selectedTo).toEqual(mockCurrencies[0].name);
    }));
  });
});
