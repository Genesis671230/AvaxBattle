import { ICsvHeader } from "../types";

const solanaRpcEndPoint ="https://winter-powerful-grass.solana-mainnet.discover.quiknode.pro/c345c5ce167f0bb90a02987a43d0437fb8bca37e/";

const csvHeaders: ICsvHeader[] = [
  { id: "date", title: "Date" },
  { id: "time_utc", title: "Time (UTC)" },
  { id: "tx_hash", title: "TX hash" },
  { id: "tx_inner_inst", title: "TX inner instructions" },
  { id: "tx_link", title: "TX Link" },
  { id: "source", title: "Source" },
  { id: "destination", title: "Destination" },
  { id: "source_token_account", title: "Source token account" },
  { id: "destination_token_account", title: "Destination token account" },
  { id: "amount", title: "Amount" },
  { id: "token_symbol", title: "Token Symbol" },
  { id: "token_mint", title: "Token mint" },
  { id: "queried_address", title: "Queried address" },
  { id: "counter_address", title: "Counter address" },
  { id: "amount_direction", title: "Amount direction" },
  { id: "fee", title: "Fee (SOL)" },
  { id: "instruction_type", title: "Instruction type" },
  { id: "queried_address_group", title: "Queried address group" },
  { id: "queried_address_tag", title: "Queried address tag" },
  { id: "queried_address_device", title: "Queried address Device" },
  { id: "queried_own_wallet", title: "Queried own wallet" },
  { id: "counter_address_group", title: "Counter address group" },
  { id: "counter_address_tag", title: "Counter address tag" },
  { id: "counter_address_device", title: "Counter address Device" },
  { id: "counter_own_wallet", title: "Counter own wallet" },
  { id: "tx_device_check", title: "TX device check" },
  { id: "internal_tx_check", title: "Internal TX check" },
  { id: "payment_to_provider", title: "Payment to provider" },
];

export { solanaRpcEndPoint, csvHeaders };
