import { client } from "../config";
import { ITokenMetaData } from "../types";

const getTokenMetaByMint = async (mint: string): Promise<ITokenMetaData> => {
  const metadata: ITokenMetaData =
    mint && (await client.get(`/token/meta?tokenAddress=${mint}`)).data;

  return metadata;
};

export { getTokenMetaByMint };
