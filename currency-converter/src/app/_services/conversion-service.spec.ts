import { fakeAsync, TestBed } from '@angular/core/testing';

import { ConversionService } from './conversion-service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Currency } from '../_models/currency';
import { CurrencyPayload } from '../_models/currencyPayload';
import { mockCurrencies } from '../_mocks/currency.mock';
import { baseRateMock } from '../_mocks/baseRate.mock';

const mockPayload: CurrencyPayload = {
  fromValue: 1,
  fromCurrency: 'GBP',
  toCurrency: 'USD',
};

describe('ConversionService', () => {
  let service: ConversionService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConversionService);
    controller = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrencies()', () => {
    it('should get currencies', fakeAsync(() => {
      service.getCurrencies().subscribe((currencies) => {
        expect(currencies).toEqual(mockCurrencies);
      });

      const req = controller.expectOne(() => true);
      req.flush({ response: mockCurrencies });
      expect(req.request.method).toBe('GET');
      controller.verify();
    }));

    it('should handle error', fakeAsync(() => {
      const spy = spyOn<any, string>(service, 'handleError');

      service.getCurrencies().subscribe({
        next: () => {},
        error: (error: HttpErrorResponse) => {
          expect(spy).toHaveBeenCalled();
        },
      });

      const req = controller.expectOne(() => true);
      req.flush('error', { status: 400, statusText: 'Bad Request' });
    }));
  });

  describe('convertCurrency()', () => {
    it('should get currencies', fakeAsync(() => {
      service.convertCurrency(mockPayload).subscribe((currencies) => {
        expect(currencies).toEqual(1);
      });

      const req = controller.expectOne(() => true);
      req.flush({ response: { value: 1 } });
      expect(req.request.method).toBe('GET');
      controller.verify();
    }));

    it('should handle error', fakeAsync(() => {
      const spy = spyOn<any, string>(service, 'handleError');

      service.convertCurrency(mockPayload).subscribe({
        next: () => {},
        error: (error: HttpErrorResponse) => {
          expect(spy).toHaveBeenCalled();
        },
      });

      const req = controller.expectOne(() => true);
      req.flush('error', { status: 403, statusText: 'Unauthorised' });
    }));
  });

  describe('getLatestRate()', () => {
    it('should get the rate between two currencies', fakeAsync(() => {
      service.getLatestRate('GBP', 'USD').subscribe((baseRate) => {
        expect(baseRate).toEqual(baseRateMock);
      });

      const req = controller.expectOne(() => true);
      req.flush({ response: baseRateMock });
      expect(req.request.method).toBe('GET');
      controller.verify();
    }));

    it('should handle error', fakeAsync(() => {
      const spy = spyOn<any, string>(service, 'handleError');

      service.getLatestRate('GBP', 'USD').subscribe({
        next: () => {},
        error: (error: HttpErrorResponse) => {
          expect(spy).toHaveBeenCalled();
        },
      });

      const req = controller.expectOne(() => true);
      req.flush('error', { status: 403, statusText: 'Unauthorised' });
    }));
  });

  describe('handleError()', () => {
    it('returns an observanle of the provided error', () => {
      const mockHttpError = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
      });
      const result = service['handleError'](mockHttpError);
      result.subscribe((error) => expect(error).toEqual(mockHttpError));
    });
  });
});
