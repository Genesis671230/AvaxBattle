/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";
import { getMint } from "../utils";
import { isSolTransfer } from "../utils/isSolTransfer";
import { getAmountDirection } from "../utils/getAmountDirection";
export async function createCsvObject(
  instruction: any,
  solanaClient: Connection,
  feePayer: string | undefined,
  signer: string | undefined,
  fee = "",
  feeAlreadyShown = false
): Promise<Record<any, any>> {
  const { parsed } = instruction;
  const isSol = isSolTransfer(instruction);
  const mint = getMint(instruction);
  let metadata;
  if (!isSol) {
    metadata =
      mint &&
      (
        await axios.get(
          `https://public-api.solscan.io/token/meta?tokenAddress=${mint}`
        )
      ).data;
    if (!metadata?.symbol && metadata?.tokenAddress) {
      metadata = (
        await axios.get(
          `https://public-api.solscan.io/token/meta?tokenAddress=${metadata.tokenAddress}`
        )
      )?.data;
    }
    console.log("metadata", metadata);
  }
  const destination =
    !isSol &&
    instruction.parsed?.info?.destination &&
    (await //@ts-ignore
    (
      await solanaClient.getParsedAccountInfo(
        new PublicKey(instruction.parsed.info.destination)
        )
        //@ts-ignore
    )?.value?.data?.parsed?.info?.owner);

  const source =
    !isSol &&
    instruction.parsed?.info?.source &&
    (await //@ts-ignore
    (
      await solanaClient.getParsedAccountInfo(
        new PublicKey(instruction.parsed.info.source)
        )
        //@ts-ignore
    )?.value?.data?.parsed?.info?.owner);

  const amountDirection = getAmountDirection(
    isSol,
    instruction,
    metadata,
    signer,
    destination,
    source
  );
  console.log("fee check",feeAlreadyShown);
  console.log(
    "fee",
    !feeAlreadyShown
      ? feePayer === signer
        ? `-${fee}`
        : ""
      : feePayer === signer &&
        parsed.type !== "transfer" &&
        parsed.info["lamports"]
      ? `-${parsed.info.lamports / 1e9}`
      : ""
  );

  return {
    source: (source && source) || parsed?.info.source || "",
    destination: (destination && destination) || parsed?.info.destination || "",
    source_token_account: isSol
      ? ""
      : parsed.type === "transferChecked" || parsed.type === "transfer"
      ? parsed.info.source
      : "",
    destination_token_account: isSol
      ? ""
      : parsed.type === "transferChecked" || parsed.type === "transfer"
      ? parsed.info.destination
      : "",
    amount:
      parsed.type === "transfer"
        ? parsed.info["amount"]
          ? metadata?.tokenAmount?.decimals
            ? parsed.info.amount / Number(`1e${metadata.tokenAmount.decimals}`)
            : parsed.info.amount
          : parsed.info?.lamports && parsed.info?.lamports / 1e9
        : parsed.type === "transferChecked" &&
          instruction.program === "spl-token"
        ? parsed.info?.tokenAmount?.uiAmountString || parsed.info.amount
        : "",
    token_symbol: isSol ? "SOL" : metadata?.symbol || "",
    token_mint: isSol ? "" : parsed.info.mint || "",
    queried_address: signer,
    counter_address: destination || "",
    amount_direction: amountDirection || "",
    fee: !feeAlreadyShown
      ? feePayer === signer
        ? `-${fee}`
        : ""
      : feePayer === signer &&
        parsed.type !== "transfer" &&
        parsed.info["lamports"]
      ? `-${parsed.info.lamports / 1e9}`
      : "",
    instruction_type: parsed.type || "Unknown Transaction",
  };
}
