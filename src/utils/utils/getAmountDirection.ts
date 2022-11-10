/* eslint-disable @typescript-eslint/no-explicit-any */
export const getAmountDirection = (
  isSol: boolean,
  instruction: {
    type: string;
    parsed: {
      type: string;
      info: {
        source: string;
        destination: string;
        tokenAmount: any;amount: number; lamports: number
};
      source: string | undefined;
      destination: string | undefined;
    };
  },
  metadata: {tokenAmount: {decimals: number}},
  signer: string | undefined,
  destination: string | undefined,
  source: string | undefined
):any => {
  let amountDirection;

  if (!isSol) {
    amountDirection =
      signer === destination &&
      (instruction.parsed.type === 'transfer' ||
        instruction.type === 'transferChecked')
        ? metadata?.tokenAmount?.decimals
          ? Number(instruction.parsed.info.amount) /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed?.info?.tokenAmount
          ? instruction.parsed?.info?.tokenAmount.uiAmountString
          : instruction.parsed.info.amount ||
            instruction.parsed.info.lamports / 1e9
        : signer === source && instruction.parsed.type === 'transfer'
        ? `-${
            metadata?.tokenAmount?.decimals
              ? instruction.parsed.info.amount /
                Number(`1e${metadata.tokenAmount.decimals}`)
              : instruction.parsed?.info?.tokenAmount
              ? instruction.parsed?.info?.tokenAmount.uiAmountString
              : instruction.parsed.info.amount ||
                instruction.parsed.info.lamports / 1e9
          }`
        : metadata?.tokenAmount?.decimals
        ? instruction.parsed.info.amount /
          Number(`1e${metadata.tokenAmount.decimals}`)
        : instruction.parsed?.info?.tokenAmount
        ? instruction.parsed?.info?.tokenAmount.uiAmountString
        : instruction.parsed.info.amount ||
          instruction.parsed.info.lamports / 1e9;
  } else {
    amountDirection =
      instruction.parsed.info.source &&
      instruction.parsed.info.source === signer &&
      instruction.parsed.type === 'transfer'
        ? `-${
            metadata?.tokenAmount?.decimals
              ? instruction.parsed.info.amount /
                Number(`1e${metadata?.tokenAmount?.decimals}`)
              : instruction.parsed.info.amount ||
                instruction.parsed.info.lamports / 1e9
          }`
        : instruction.parsed.info.destination &&
          instruction.parsed.info.destination === signer &&
          instruction.parsed.type === 'transfer'
        ? metadata?.tokenAmount?.decimals
          ? instruction.parsed.info.amount /
            Number(`1e${metadata?.tokenAmount?.decimals}`)
          : instruction.parsed.info.amount ||
            instruction.parsed.info.lamports / 1e9
        : metadata?.tokenAmount?.decimals
        ? instruction.parsed.info.amount /
          Number(`1e${metadata?.tokenAmount?.decimals}`)
        : instruction.parsed?.info?.amount ||
          instruction.parsed?.info?.lamports / 1e9;
  }

  return amountDirection;
};
