import promiseConcurrencySkip from "./promiseAllConcurrency";
import { solanaClient } from "../config";
import {
  IInstruction,
  IParsedTransactionMapperWithSignature,
} from "../types/index";

export const getTransactionsMapper = async (
  signature: string
): Promise<
  IParsedTransactionMapperWithSignature | never
> => {
  try {
    const transactionDetails = (await solanaClient.getParsedTransaction(
      signature
    )) as IInstruction;
    return { transactionDetails, signature };
  } catch {
    return promiseConcurrencySkip as never;
  }
};
