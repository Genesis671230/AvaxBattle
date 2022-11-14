import { Connection } from "@solana/web3.js";
import axios from "axios";
import axiosRetry from "axios-retry";
import { solanaRpcEndPoint } from "./constants";

const client = axios.create({ baseURL: "https://public-api.solscan.io" });
axiosRetry(client, {
  retries: 6,
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return 6000;
  },
  retryCondition: (error) => {
    return error.response.status === 429;
  },
});

const solanaClient = new Connection(solanaRpcEndPoint);

export { client, solanaClient };
