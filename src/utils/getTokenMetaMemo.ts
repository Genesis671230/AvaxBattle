import { ITokenMetaData } from "../types";
import { getTokenMetaByMint } from "./getTokenMetaByMint";
import { getTokenMetaByTokenAddress } from "./getTokenMetaByTokenAddress";

export default function (): (
  mint: string,
  reset?: boolean
) => Promise<ITokenMetaData> | undefined {
  const memo: Map<string, ITokenMetaData> = new Map();

  return async (mint: string, reset = false): Promise<ITokenMetaData> => {
    if (reset) {
      memo.clear();
      return undefined;
    }
    if (memo.has(mint)) {
      console.log("from cache with mint");
      return memo.get(mint);
    }
    const metadata = await getTokenMetaByMint(mint);
    if (metadata?.symbol) {
      memo.set(mint, metadata);
      return metadata;
    }
    if (!metadata?.symbol && metadata?.tokenAddress) {
      if (memo.has(metadata?.tokenAddress)) {
        console.log("from cache with token address");
        return memo.get(metadata.tokenAddress);
      }
      return await getTokenMetaByTokenAddress(metadata.tokenAddress);
    }
  };
}
