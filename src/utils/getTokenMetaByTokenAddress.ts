import { client } from "../config";
import { ITokenMetaData } from "../types";

const getTokenMetaByTokenAddress = async (
  tokenAddress: string
): Promise<ITokenMetaData> => {
  const metadata: ITokenMetaData = (
    await client.get(`/token/meta?tokenAddress=${tokenAddress}`)
  )?.data;
  return metadata;
};

export { getTokenMetaByTokenAddress };
