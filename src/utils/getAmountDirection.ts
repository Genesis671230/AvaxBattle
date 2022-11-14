import { tranasctionTypeToProcess } from "../constants";
import { IInstruction, ITokenMetaData } from "../types/index";
export const getAmountDirection = (
  isSol: boolean,
  instruction: IInstruction,
  metadata: ITokenMetaData,
  signer: string | undefined,
  destination: string | undefined,
  source: string | undefined
): string | number => {
  let amountDirection;
  if (!isSol) {
    amountDirection =
      signer === destination &&
      (tranasctionTypeToProcess.has(instruction.parsed.type) ||
        tranasctionTypeToProcess.has(instruction.type))
        ? metadata?.tokenAmount?.decimals
          ? Number(instruction.parsed.info.amount) /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed?.info?.tokenAmount
          ? instruction.parsed?.info?.tokenAmount.uiAmountString
          : instruction.parsed.info.amount ||
            instruction.parsed.info.lamports / 1e9
        : signer === source &&
          (tranasctionTypeToProcess.has(instruction.parsed.type) ||
            tranasctionTypeToProcess.has(instruction.type))
        ? `-${
            metadata?.tokenAmount?.decimals
              ? instruction.parsed.info.amount /
                Number(`1e${metadata.tokenAmount.decimals}`)
              : instruction.parsed?.info?.tokenAmount
              ? instruction.parsed?.info?.tokenAmount.uiAmountString
              : instruction.parsed.info.amount ||
                instruction.parsed.info.lamports / 1e9
          }`
        : tranasctionTypeToProcess.has(instruction.parsed.type) ||
          tranasctionTypeToProcess.has(instruction.type)
        ? metadata?.tokenAmount?.decimals
          ? instruction.parsed.info.amount /
            Number(`1e${metadata.tokenAmount.decimals}`)
          : instruction.parsed?.info?.tokenAmount
          ? instruction.parsed?.info?.tokenAmount.uiAmountString
          : instruction.parsed.info.amount ||
            instruction.parsed.info.lamports / 1e9
        : "";
  } else {
    amountDirection =
      instruction.parsed.info.source &&
      instruction.parsed.info.source === signer &&
      (tranasctionTypeToProcess.has(instruction.parsed.type) ||
        tranasctionTypeToProcess.has(instruction.type))
        ? `-${
            metadata?.tokenAmount?.decimals
              ? instruction?.parsed?.info?.amount /
                Number(`1e${metadata?.tokenAmount?.decimals}`)
              : instruction?.parsed?.info?.amount ||
                instruction?.parsed?.info?.lamports / 1e9
          }`
        : instruction.parsed.info.destination &&
          instruction.parsed.info.destination === signer &&
          (tranasctionTypeToProcess.has(instruction.parsed.type) ||
            tranasctionTypeToProcess.has(instruction.type))
        ? metadata?.tokenAmount?.decimals
          ? instruction.parsed?.info?.amount /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed?.info?.amount ||
            instruction.parsed?.info?.lamports / 1e9
        : tranasctionTypeToProcess.has(instruction.parsed.type) ||
          tranasctionTypeToProcess.has(instruction.type)
        ? metadata?.tokenAmount?.decimals
          ? instruction.parsed.info.amount /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed?.info?.amount ||
            instruction.parsed?.info?.lamports / 1e9
        : "";
  }

  return amountDirection;
};
