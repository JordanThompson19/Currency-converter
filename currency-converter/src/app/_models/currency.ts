export interface Currency {
  id: number;
  name: string;
  short_code: string;
  code: string;
  precision: number;
  subUnit: number;
  symbol: string;
  symbol_first: boolean;
  decimal_mark: string;
  thousands_seperator: string;
}
