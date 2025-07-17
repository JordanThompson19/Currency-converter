import { Currency } from '../_models/currency';

export const mockCurrencies: Currency[] = [
  {
    id: 1,
    name: 'Pound Sterling',
    short_code: 'GBP',
    code: '826',
    precision: 2,
    subUnit: 100,
    symbol: '£',
    symbol_first: true,
    decimal_mark: '.',
    thousands_seperator: ',',
  },
    {
    id: 2,
    name: 'US Dollar',
    short_code: 'USD',
    code: '824',
    precision: 2,
    subUnit: 100,
    symbol: '$',
    symbol_first: true,
    decimal_mark: '.',
    thousands_seperator: ',',
  },
];
