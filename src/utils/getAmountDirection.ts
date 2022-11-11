import { IInstruction } from "../types/index";
export const getAmountDirection = (
  isSol: boolean,
  instruction: IInstruction,
  metadata: { tokenAmount: { decimals: number } },
  signer: string | undefined,
  destination: string | undefined,
  source: string | undefined
): string | number => {
  let amountDirection;
  console.log("destination", destination);
  console.log("source", source);
  console.log("signer", signer);

  if (!isSol) {
    amountDirection =
      signer === destination &&
      (instruction.parsed.type === "transfer" ||
        instruction.type === "transferChecked")
        ? metadata?.tokenAmount?.decimals
          ? Number(instruction.parsed.info.amount) /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed?.info?.tokenAmount
          ? instruction.parsed?.info?.tokenAmount.uiAmountString
          : instruction.parsed.info.amount ||
            instruction.parsed.info.lamports / 1e9
        : signer === source &&
          (instruction.parsed.type === "transfer" ||
            instruction.type === "transferChecked")
        ? `-${
            metadata?.tokenAmount?.decimals
              ? instruction.parsed.info.amount /
                Number(`1e${metadata.tokenAmount.decimals}`)
              : instruction.parsed?.info?.tokenAmount
              ? instruction.parsed?.info?.tokenAmount.uiAmountString
              : instruction.parsed.info.amount ||
                instruction.parsed.info.lamports / 1e9
          }`
        : instruction.parsed.type === "transfer" ||
          instruction.type === "transferChecked"
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
      instruction.parsed.type === "transfer"
        ? `-${
            metadata?.tokenAmount?.decimals
              ? instruction.parsed.info.amount /
                Number(`1e${metadata?.tokenAmount?.decimals}`)
              : instruction.parsed.info.amount ||
                instruction.parsed.info.lamports / 1e9
          }`
        : instruction.parsed.info.destination &&
          instruction.parsed.info.destination === signer &&
          instruction.parsed.type === "transfer"
        ? metadata?.tokenAmount?.decimals
          ? instruction.parsed.info.amount /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed.info.amount ||
            instruction.parsed.info.lamports / 1e9
        : instruction.parsed.type === "transfer"
        ? metadata?.tokenAmount?.decimals
          ? instruction.parsed.info.amount /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed?.info?.amount ||
            instruction.parsed?.info?.lamports / 1e9
        : "";
  }

  return amountDirection;
};
