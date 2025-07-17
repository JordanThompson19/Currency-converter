import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
import {
  debounceTime,
  merge,
  Observable,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { CurrencyPayload } from '../_models/currencyPayload';
import { BaseRate } from '../_models/baseRate';

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

  private destroy$ = new Subject<void>();

  public conversionForm!: UntypedFormGroup;
  public currencies: Currency[] = [];
  public baseRate!: string;
  public selectedTo: string = '';
  public selectedFrom: string = '';

  private defaultFromCurrencyCode = 'GBP';
  private defaultToCurrencyCode = 'USD';

  ngOnInit(): void {
    this.createForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create the form and add relevant subscriptions
   */
  private createForm(): void {
    this.conversionForm = this.fb.group({
      fromValue: null,
      fromCurrency: null,
      toValue: null,
      toCurrency: null,
    });

    this.subscribeToCurrencies();
    this.subscribeToNewToValue();
  }

  /**
   * Subscribe to get the currencies
   */
  private subscribeToCurrencies(): void {
    this.conversionService
      .getCurrencies()
      .pipe(takeUntil(this.destroy$))
      .subscribe((currencies: Currency[]) => {
        this.currencies = currencies;

        this.subscribeToChanges();
        this.applyDefaults();
      });
  }

  /**
   * Apply defined defaulted currencies
   */
  private applyDefaults(): void {
    // Set some defaults, for now just set to UK and US currencies.
    this.conversionForm.controls['fromCurrency'].patchValue(
      this.defaultFromCurrencyCode
    );

    this.conversionForm.controls['toCurrency'].patchValue(
      this.defaultToCurrencyCode
    );

    this.conversionForm.controls['fromValue'].patchValue(1);
  }

  /**
   * Subscribe to form changes to recalculate conversions
   */
  private subscribeToChanges(): void {
    // Merge these value changes together as we perform the same action
    merge(
      this.conversionForm.controls['fromValue'].valueChanges,
      this.conversionForm.controls['fromCurrency'].valueChanges,
      this.conversionForm.controls['toCurrency'].valueChanges
    )
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        const payload: CurrencyPayload = {
          fromCurrency: this.conversionForm.controls['fromCurrency'].value,
          toCurrency: this.conversionForm.controls['toCurrency'].value,
          fromValue: this.conversionForm.controls['fromValue'].value,
        };
        this.updateConversion(payload);
        // Improvement, this should only be called when a currency has been updated
        this.getConversionRate();
      });
  }

  /**
   * Subscribe to the ToValue field and update conversions when changed
   */
  private subscribeToNewToValue(): void {
    // Handle edge case of changing the toValue and updating the From
    this.conversionForm.controls['toValue'].valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        const payload: CurrencyPayload = {
          fromCurrency: this.conversionForm.controls['toCurrency'].value,
          toCurrency: this.conversionForm.controls['fromCurrency'].value,
          fromValue: this.conversionForm.controls['toValue'].value,
        };

        this.updateConversion(payload, true);
      });
  }

  /**
   * Update the relevant fields depending on which values have been updated
   * @param payload The payload to get the new converstion rate
   * @param toValueUpdated If the toValue control has been updated
   */
  private updateConversion(
    payload: CurrencyPayload,
    toValueUpdated: boolean = false
  ): void {
    this.conversionService
      .convertCurrency(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        // update the toValue control, and fix to 2 decimal places
        if (toValueUpdated) {
          this.conversionForm.controls['fromValue'].patchValue(
            value.toFixed(2),
            { emitEvent: false }
          );
        } else {
          this.conversionForm.controls['toValue'].patchValue(value.toFixed(2), {
            emitEvent: false,
          });
        }
      });
  }

  /**
   * Get the conversion rate for the selected currencies
   */
  private getConversionRate(): void {
    const base = this.conversionForm.controls['fromCurrency'].value;
    const conversionCurrency = this.conversionForm.controls['toCurrency'].value;

    this.conversionService
      .getLatestRate(base, conversionCurrency)
      .pipe(takeUntil(this.destroy$))
      .subscribe((rate: BaseRate) => {
        this.baseRate = rate.rates[conversionCurrency].toFixed(2);
        this.selectedTo =
          this.currencies.find((curr) => curr.short_code === base)?.name ?? '';

        this.selectedFrom =
          this.currencies.find((curr) => curr.short_code === conversionCurrency)
            ?.name ?? '';
      });
  }
}
