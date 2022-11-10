export interface IJsonCsvData {
  address: string;
  group: string;
  tags: string;
  device: string;
  own_wallet: string;
  provider: string;
}

type TAllowedValues = 'group' | 'tag' | 'address';
type TAllowedSymbols = 'sol' | 'mbs' | 'all';

export interface IAllowedArguments {
  [x: string]: unknown;
  startDate: string;
  endDate: string;
  pullDataBy: TAllowedValues;
  pullDataByValue: string | string[];
  symbol: TAllowedSymbols;
}

export interface ICsvHeader {
  id: string;
  title: string;
}
