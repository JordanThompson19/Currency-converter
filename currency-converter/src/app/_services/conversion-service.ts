import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Currency } from '../_models/currency';
import { catchError, map, Observable, of } from 'rxjs';
import { CurrencyPayload } from '../_models/currencyPayload';
import { BaseRate } from '../_models/baseRate';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  private http = inject(HttpClient);

  private apiKey = 'MdPahnZ272uN73702AJ1f3CgGnCOmbIZ';
  private baseURL = 'https://api.currencybeacon.com/v1';

  /**
   * Get a list of currencies
   * @returns The currency list array
   */
  public getCurrencies(): Observable<Currency[]> {
    const url = `${this.baseURL}/currencies?api_key=${this.apiKey}`;

    return this.http.get<Currency[]>(url, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body.response;
      }),
      catchError((error) => this.handleError<Currency[]>(error))
    );
  }

  /**
   * Convert provided currency and value to defined currency
   * @param payload The currency and values to be converted
   * @returns The converted number in the desired currency
   */
  public convertCurrency(payload: CurrencyPayload): Observable<number> {
    const url = `${this.baseURL}/convert?api_key=${this.apiKey}&from=${payload.fromCurrency}&to=${payload.toCurrency}&amount=${payload.fromValue}`;

    return this.http.get<number[]>(url, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body.response.value;
      }),
      catchError((error) => this.handleError<number>(error))
    );
  }

  /**
   * Get the latest rates between two currencies
   * @param base The short code of the base currency
   * @param exchangeCurrency The short code of the currency to compare to the base
   * @returns A base rate of the currencies
   */
  public getLatestRate(
    base: string,
    exchangeCurrency: string
  ): Observable<BaseRate> {
    const url = `${this.baseURL}/latest?api_key=${this.apiKey}&base=${base}&symbols=${exchangeCurrency}`;

    return this.http.get<BaseRate>(url, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body.response;
      }),
      catchError((error) => this.handleError<BaseRate>(error))
    );
  }

  /**
   * Generic error handling, can be expanded in future
   * @param error The error being processed
   * @returns the error
   */
  private handleError<T>(error: HttpErrorResponse): Observable<T> {
    // Put error in console, expand error handling in future
    // e.g. 429 error if we reach API limit
    console.error('Error Occurred', error);
    return of(error as T);
  }
}
