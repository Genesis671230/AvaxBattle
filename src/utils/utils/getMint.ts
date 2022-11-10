/* eslint-disable @typescript-eslint/no-explicit-any */
export const getMint = (instruction: {
  program?: any;
  parsed?: any;
}): string | undefined => {
  const { parsed } = instruction;
  console.log("instruction", instruction.program);
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

  if (instruction.program === "spl-token") {
    mint = parsed.info.destination || parsed.info.source;
    return mint;
  }
  return undefined;
};
