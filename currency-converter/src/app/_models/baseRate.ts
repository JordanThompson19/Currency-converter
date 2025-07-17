export interface BaseRate {
  date: string;
  base: string;
  rates: { [key: string]: number };
}
