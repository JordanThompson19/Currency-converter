import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConversionService } from '../_services/conversion-service';
import { Currency } from '../_models/currency';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { debounceTime, merge, Observable, Subscription } from 'rxjs';
import { currencyPayload } from '../_models/currencyPayload';

@Component({
  selector: 'app-conversion-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './conversion-form.html',
  standalone: true,
  styleUrl: './conversion-form.scss',
})
export class ConversionForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private conversionService = inject(ConversionService);

  public conversionForm!: UntypedFormGroup;
  public currencies: Currency[] = [];

  private currencySubscription!: Subscription;
  private conversionSubscription!: Subscription;
  private defaultFromCurrencyCode = 'GBP';
  private defaultToCurrencyCode = 'USD';

  ngOnInit(): void {
    this.createForm();
  }

  ngOnDestroy(): void {
    // Make sure to unsubscribe from all subscriptions
    this.currencySubscription.unsubscribe();
    this.conversionSubscription.unsubscribe();
  }

  private createForm(): void {
    this.conversionForm = this.fb.group({
      fromValue: null,
      fromCurrency: null,
      toValue: null,
      toCurrency: null,
    });

    this.subscribeToCurrencies();
    this.subscribeToChanges();
  }

  private subscribeToCurrencies(): void {
    this.currencySubscription = this.conversionService
      .getCurrencies()
      .subscribe((currencies) => {
        this.currencies = [...currencies];

        // TODO break into own method for testing.
        // Set some defaults, for now just set to UK and US currencies.
        this.conversionForm.controls['fromCurrency'].patchValue(
          this.defaultFromCurrencyCode
        );

        this.conversionForm.controls['toCurrency'].patchValue(
          this.defaultToCurrencyCode
        );
      });
  }

  private subscribeToChanges(): void {
    merge(
      this.conversionForm.controls['fromValue'].valueChanges,
      this.conversionForm.controls['fromCurrency'].valueChanges,
      this.conversionForm.controls['toCurrency'].valueChanges
    )
      .pipe(debounceTime(200))
      .subscribe(() => this.updateConversion());
  }

  private updateConversion(): void {
    const payload: currencyPayload = {
      fromCurrency: this.conversionForm.controls['fromCurrency'].value,
      toCurrency: this.conversionForm.controls['toCurrency'].value,
      fromValue: this.conversionForm.controls['fromValue'].value,
    };

    this.conversionSubscription = this.conversionService
      .convertCurrency(payload)
      .subscribe((value: number) => {
        // update the toValue control, and fix to 2 decimal places
        this.conversionForm.controls['toValue'].patchValue(value.toFixed(2));
      });
  }

  // TODO Error handling

  // TODO Style a little bit

  // A switch currencies around button?

  // TODO UTs
}
