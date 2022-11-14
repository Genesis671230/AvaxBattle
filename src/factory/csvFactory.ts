import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, useMemoToken } from "../utils/";
import { isSolTransfer } from "../utils/";
import { getAmountDirection } from "../utils/getAmountDirection";
import { IInstruction } from "../types";
import { tranasctionTypeToProcess } from "../constants";

export async function createCsvObject(
  instruction: IInstruction,
  solanaClient: Connection,
  feePayer: string | undefined,
  signer: string | undefined,
  fee = "",
  feeAlreadyShown = false
): Promise<Record<string, string | number | undefined>> {
  const { parsed } = instruction;
  const isSol = isSolTransfer(instruction);
  let metadata;
  if (!isSol) {
    try {
     
      const mint = getMint(instruction);
      metadata = await useMemoToken(mint);
    } catch (error) {
      console.log("request failed for meta data with error", error);
    }
  }
  const destination =
    !isSol &&
    instruction.parsed?.info?.destination &&
    (await 
    (
      await solanaClient.getParsedAccountInfo(
        new PublicKey(instruction.parsed.info.destination)
        )
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
    )?.value?.data?.parsed?.info?.owner);

  const source =
    !isSol &&
    instruction.parsed?.info?.source &&
    (await 
    (
      await solanaClient.getParsedAccountInfo(
        new PublicKey(instruction.parsed.info.source)
        )
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        )?.value?.data?.parsed?.info?.owner);

  const amountDirection = getAmountDirection(
    isSol,
    instruction,
    metadata,
    signer,
    isSol
      ? instruction.parsed?.info?.destination &&
          instruction.parsed?.info?.destination
      : destination,
    isSol
      ? instruction.parsed?.info?.source && instruction.parsed?.info?.source
      : source
  );
  return {
    source: (source && source) || parsed?.info.source || "",
    destination: (destination && destination) || parsed?.info.destination || "",
    source_token_account: isSol
      ? ""
      : tranasctionTypeToProcess.has(parsed.type)
      ? parsed.info?.source
      : "",
    destination_token_account: isSol
      ? ""
      : tranasctionTypeToProcess.has(parsed.type)
      ? parsed.info?.destination
      : "",
    amount:
    tranasctionTypeToProcess.has(parsed.type) 
        ? parsed.info["amount"]
          ? metadata?.tokenAmount?.decimals
            ? parsed.info.amount / Number(`1e${metadata.tokenAmount.decimals}`)
            : parsed.info.amount
          : parsed.info?.lamports && parsed.info?.lamports / 1e9
        : tranasctionTypeToProcess.has(parsed.type) &&
          instruction.program === "spl-token"
        ? parsed.info?.tokenAmount?.uiAmountString || parsed.info.amount
        : "",
    token_symbol: isSol ? "SOL" : metadata?.symbol || "",
    token_mint: isSol ? "" : parsed.info?.mint || "",
    queried_address: signer,
    counter_address: destination || "",
    amount_direction: amountDirection || "",
    fee: !feeAlreadyShown
      ? feePayer === signer
        ? `-${fee}`
        : ""
      : feePayer === signer &&
      !tranasctionTypeToProcess.has(parsed.type) &&
        parsed.info["lamports"]
      ? `-${parsed.info.lamports / 1e9}`
      : "",
    instruction_type: parsed.type || "Unknown Transaction",
  };
}
