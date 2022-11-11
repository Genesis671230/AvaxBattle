import { IInstruction } from "../types";

export const getMint = (instruction: IInstruction): string | undefined => {
  const { parsed } = instruction;
  let mint = "";
  if (
    parsed &&
    (parsed.type === "create" ||
      parsed.type === "mintTo" ||
      parsed.type === "getAccountDataSize")
  ) {
    mint = parsed.info.mint || parsed.info.tokenAddress;
    return mint;
  }
  console.log("instruction program",instruction.program);
  
  if (instruction.program === "spl-token") {
    mint = parsed.info.destination || parsed.info.source;
    return mint;
  }
  return undefined;
};
