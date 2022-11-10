import {
  ConfirmedSignatureInfo,
  Connection,
  PublicKey,
  PublicKeyInitData,
} from "@solana/web3.js";

const data: string[] = [];
const LIMIT = 200;
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
  console.log("fromDate", fromDate);
  console.log("toDate", toDate);
  console.log("address", address);

  solanaClient = solanaClient_;
  let i = 0;
  let oldestSignature = "";
  while (i === 0) {
    const result = await getSignatures(oldestSignature, address);
    i = result.value;
    oldestSignature = result?.returnSignature;
  }
  console.log("data", data);

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
  console.log("signatures", signatures);
  signatures.forEach((sig) => {
    if (sig.blockTime && sig.blockTime >= fromDate && sig.blockTime <= toDate) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      data.push(sig?.signature);
    }
  });
  if (count < LIMIT) return { value: 1, returnSignature: oldestSignature };
  return { value: 0, returnSignature: oldestSignature };
};
