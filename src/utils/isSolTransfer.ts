import { IInstruction } from "../types/index";

export const isSolTransfer = (instuction: IInstruction): boolean => {
  let isSol = false;
  if (
    instuction.parsed.type === "transfer" &&
    instuction.parsed.info.lamports
  ) {
    isSol = true;
  }
  return isSol;
};
