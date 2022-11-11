import { ParsedTransactionWithMeta } from "@solana/web3.js";

export interface IJsonCsvData {
  address: string;
  group: string;
  tags: string;
  device: string;
  own_wallet: string;
  provider: string;
}

type TAllowedValues = "group" | "tag" | "address";
type TAllowedSymbols = "sol" | "mbs" | "all";

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

export interface IInstruction extends ParsedTransactionWithMeta {
  index: number;
  instructions: IInstruction;
  type: string;
  parsed: {
    type: string;
    info: {
      tokenAddress?: string;
      mint: string;
      source: string;
      destination: string;
      tokenAmount: Record<string, string|number>;
      amount: number;
      lamports: number;
    };
    source: string | undefined;
    destination: string | undefined;
  };
  program:string | undefined
}
