import {
  ConfirmedSignatureInfo,
  Connection,
  PublicKey,
  PublicKeyInitData,
} from "@solana/web3.js";

const data: string[] = [];
const LIMIT = 900;
let fromDate = 0;
let toDate = 0;
let solanaClient: Connection;

export const getSignaturesByTime = async (
  fromDate_: number,
  toDate_: number,
  solanaClient_: Connection,
  address: string
): Promise<string[]> => {
  fromDate = fromDate_;
  toDate = toDate_;
  solanaClient = solanaClient_;
  let i = 0;
  let oldestSignature = "";
  while (i === 0) {
    const result = await getSignatures(oldestSignature, address);
    i = result.value;
    oldestSignature = result?.returnSignature;
  }

  return data;
};


const getSignatures = async (
  oldestSignature: string,
  address: PublicKeyInitData
) => {
  let signatures: ConfirmedSignatureInfo[] = [];

  if (oldestSignature === "") {
    signatures = await solanaClient.getSignaturesForAddress(
      new PublicKey(address),
      { limit: LIMIT }
    );
  } else {
    signatures = await solanaClient.getSignaturesForAddress(
      new PublicKey(address),
      { before: oldestSignature, limit: LIMIT }
    );
  }
  const count = signatures.length;

  oldestSignature = signatures[count - 1]?.signature;
  signatures.forEach((sig) => {
    if (sig.blockTime && sig.blockTime >= fromDate && sig.blockTime <= toDate) {
      data.push(sig?.signature);
    }
  });
  if (count < LIMIT) return { value: 1, returnSignature: oldestSignature };
  return { value: 0, returnSignature: oldestSignature };
};
