/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isSolTransfer = (instuction: any):boolean => {
  let isSol = false;
  if (
    instuction.parsed.type === 'transfer' &&
    instuction.parsed.info.lamports
  ) {
    isSol = true;
  }
  return isSol;
};
