import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Currency } from '../_models/currency';
import { map, Observable } from 'rxjs';
import { currencyPayload } from '../_models/currencyPayload';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  private http = inject(HttpClient);

  private apiKey = 'MdPahnZ272uN73702AJ1f3CgGnCOmbIZ';
  private baseURL = 'https://api.currencybeacon.com/v1';

  public getCurrencies(): Observable<Currency[]> {
    const url = `${this.baseURL}/currencies?api_key=${this.apiKey}`;

    return this.http.get<Currency[]>(url, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body.response;
      })
    );
  }

  public convertCurrency(payload: currencyPayload): Observable<number> {
    const url = `${this.baseURL}/convert?api_key=${this.apiKey}&from=${payload.fromCurrency}&to=${payload.toCurrency}&amount=${payload.fromValue}`;

    return this.http.get<Currency[]>(url, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body.response.value;
      })
    );
  }
}
