import { Connection, PublicKey } from "@solana/web3.js";
import { createObjectCsvWriter } from "csv-writer";
import { csvHeaders, solanaRpcEndPoint } from "../constants/index";
import { createCsvObject } from "../factory";
import { IAllowedArguments, IJsonCsvData } from "../types";
import { getSignaturesByTime } from "../utils/getSignatures";
import fs from "fs";
import { IInstruction } from "../types/index";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Alert = require("electron-alert");

export const createCsv = async (
  params: IAllowedArguments,
  jsonCsvData: IJsonCsvData[]
): Promise<string> => {
  const { endDate, pullDataBy, pullDataByValue, startDate, symbol } = params;

  if (Date.parse(String(endDate)) < Date.parse(String(startDate))) {
    const swalOptions = {
      position: "top-end",
      title: "Invalid Date",
      icon: "error",
      showConfirmButton: true,
      timer: 3000,
    };

    Alert.fireToast(swalOptions);
    return;
  }
  let address_: PublicKey | IJsonCsvData[];

  if (pullDataBy === "tag") {
    address_ = jsonCsvData.filter((data) => data.tags === pullDataByValue);
  } else if (pullDataBy === "group") {
    address_ = jsonCsvData.filter((data) => data.group === pullDataByValue);
  } else {
    address_ = pullDataByValue as unknown as PublicKey;
  }

  if (pullDataBy === "tag" || pullDataBy === "group") {
    if (Array.isArray(address_) && address_.length === 0) {
      const swalOptions = {
        position: "top-end",
        title: "Invalid Group or Tag",
        icon: "error",
        showConfirmButton: true,
        timer: 3000,
      };

      Alert.fireToast(swalOptions);
      return;
    }
  }
  fs.unlink("output.csv", function (err) {
    if (err && err.code == "ENOENT") {
      console.info("File doesn't exist, won't remove it.");
    } else if (err) {
      console.error("Error occurred while trying to remove file");
    } else {
      console.info(`removed`);
    }
  });

  const solanaClient = new Connection(solanaRpcEndPoint);

  const csvData = [];
  if (Array.isArray(address_)) {
    const transactionsByAddress: Array<string> = [];
    for (const address of address_) {
      transactionsByAddress.push(
        ...(await getSignaturesByTime(
          Date.parse(String(startDate)) / 1000,
          Date.parse(String(endDate)) / 1000,
          solanaClient,
          address.address
        ))
      );
    }
    console.log("transactions", transactionsByAddress);

    if (transactionsByAddress) {
      const group = address_[0].group;
      const tags = address_[0].tags;
      const device = address_[0].device;
      const ownWallet = address_[0].own_wallet;
      const counterOwnWallet = address_[0].own_wallet === "TRUE";
      for (const transaction of transactionsByAddress) {
        const transactionDetails = await solanaClient.getParsedTransaction(
          transaction as string
        );
        console.log("transaction", transaction);

        const signer = transactionDetails?.transaction.signatures[0];
        const signature = transaction;
        const feePayer =
          transactionDetails?.transaction.message.accountKeys[0].pubkey.toString();
        const dateTime =
          transactionDetails?.blockTime &&
          new Date(Number(transactionDetails?.blockTime * 1000)).toLocaleString(
            "en-GB",
            { timeZone: "UTC" }
          );
        const dateTimeArray = String(dateTime)?.split(",");
        const fee =
          transactionDetails?.meta?.fee && transactionDetails.meta.fee / 1e9;
        const tx_link = `https://solscan.io/tx/${transaction}`;
        if (transactionDetails?.transaction.message.instructions) {
          let index = 0;
          mainLoop: for (const instruction of transactionDetails?.transaction
            .message.instructions as unknown as Array<IInstruction>) {
            let feeShown = false;
            if (transactionDetails.meta?.innerInstructions) {
              for (const innerTransaction of transactionDetails.meta
                ?.innerInstructions) {
                if (index === innerTransaction.index) {
                  let innerIndex = 0;
                  for (const instruction of innerTransaction.instructions as unknown as Array<IInstruction>) {
                    const { parsed } = instruction;

                    innerIndex++;
                    const number = `${
                      innerTransaction.index + 1
                    }.${innerIndex}`;

                    if (
                      (parsed &&
                        (parsed.type === "transfer" ||
                          parsed.type === "createAccount" ||
                          parsed.type === "mintTo")) ||
                      (instruction.program === "system" && parsed.info.lamports)
                    ) {
                      const csvRowObject = await createCsvObject(
                        instruction,
                        solanaClient,
                        feePayer,
                        signer,
                        String(fee),
                        feeShown
                      );
                      csvData.push({
                        date: dateTimeArray[0],
                        time_utc: dateTimeArray[1],
                        tx_hash: signature,
                        tx_inner_inst: number,
                        tx_link,
                        ...csvRowObject,
                        queried_address_group: group,
                        queried_address_tag: tags,
                        queried_address_device: device,
                        queried_own_wallet: ownWallet,
                        counter_own_wallet: counterOwnWallet,
                      });
                    }
                  }
                  index++;
                  feeShown = true;
                  continue mainLoop;
                }
              }
            }

            const { parsed } = instruction;
            if (
              (parsed &&
                (parsed.type === "transfer" ||
                  parsed.type === "createAccount" ||
                  parsed.type === "transferChecked" ||
                  parsed.type === "mintTo")) ||
              (instruction.program === "system" && parsed.info.lamports) ||
              (instruction.program === "spl-token" &&
                (parsed.info.amount || parsed.info.tokenAmount))
            ) {
              const csvRowObject = await createCsvObject(
                instruction,
                solanaClient,
                feePayer,
                signer,
                String(fee),
                feeShown
              );
              csvData.push({
                date: dateTimeArray[0],
                time_utc: dateTimeArray[1],
                tx_hash: signature,
                tx_inner_inst: index + 1,
                tx_link,
                ...csvRowObject,
              });
            }
            feeShown = true;
            index++;
          }
        }
      }
    }
  } else if (typeof address_ === "string") {
    const transactionsByAddress: Array<string> = await getSignaturesByTime(
      Date.parse(String(startDate)) / 1000,
      Date.parse(String(endDate)) / 1000,
      solanaClient,
      address_
    );

    if (transactionsByAddress) {
      for (const transaction of transactionsByAddress) {
        const transactionDetails = await solanaClient.getParsedTransaction(
          transaction as string
        );
        const signer =
          transactionDetails?.transaction.signatures.find(
            (e) => e === String(address_)
          ) || address_;
        const signature = transaction;
        const feePayer =
          transactionDetails?.transaction.message.accountKeys[0].pubkey.toString();
        const dateTime =
          transactionDetails?.blockTime &&
          new Date(Number(transactionDetails?.blockTime * 1000)).toLocaleString(
            "en-GB",
            { timeZone: "UTC" }
          );
        const dateTimeArray = String(dateTime)?.split(",");
        const fee =
          transactionDetails?.meta?.fee && transactionDetails.meta.fee / 1e9;
        console.log("fee", fee);

        const tx_link = `https://solscan.io/tx/${transaction}`;
        if (transactionDetails?.transaction.message.instructions) {
          let index = 0;
          let feeShown = false;
          mainLoop: for (const instruction of transactionDetails?.transaction
            .message.instructions as unknown as Array<IInstruction>) {
            if (transactionDetails.meta?.innerInstructions) {
              for (const innerTransaction of transactionDetails.meta
                ?.innerInstructions as unknown as Array<IInstruction>) {
                if (index === innerTransaction.index) {
                  let innerIndex = 0;
                  for (const instruction of innerTransaction.instructions as unknown as Array<IInstruction>) {
                    const { parsed } = instruction;

                    innerIndex++;
                    const number = `${
                      innerTransaction.index + 1
                    }.${innerIndex}`;

                    if (
                      (parsed &&
                        (parsed.type === "transfer" ||
                          parsed.type === "createAccount" ||
                          parsed.type === "mintTo")) ||
                      (instruction.program === "system" && parsed.info.lamports)
                    ) {
                      const csvRowObject = await createCsvObject(
                        instruction,
                        solanaClient,
                        feePayer,
                        signer,
                        String(fee),
                        feeShown
                      );
                      csvData.push({
                        date: dateTimeArray[0],
                        time_utc: dateTimeArray[1],
                        tx_hash: signature,
                        tx_inner_inst: number,
                        tx_link,
                        ...csvRowObject,
                      });
                    }
                  }
                  index++;
                  feeShown = true;
                  continue mainLoop;
                }
              }
            }

            const { parsed } = instruction as unknown as IInstruction;
            if (
              (parsed &&
                (parsed.type === "transfer" ||
                  parsed.type === "createAccount" ||
                  parsed.type === "transferChecked" ||
                  parsed.type === "mintTo")) ||
              (instruction.program === "system" && parsed.info.lamports) ||
              (instruction.program === "spl-token" &&
                (parsed.info.amount || parsed.info.tokenAmount))
            ) {
              const csvRowObject = await createCsvObject(
                instruction,
                solanaClient,
                feePayer,
                signer,
                String(fee),
                feeShown
              );
              csvData.push({
                date: dateTimeArray[0],
                time_utc: dateTimeArray[1],
                tx_hash: signature,
                tx_inner_inst: index + 1,
                tx_link,
                ...csvRowObject,
              });
            }
            index++;
            feeShown = true;
          }
        }
      }
    }
  }
  const csvWriter = createObjectCsvWriter({
    path: "output.csv",
    header: csvHeaders,
  });
  let csvData_;
  if (symbol === "mbs") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    csvData_ = csvData.filter((data) => data.token_symbol === "MBS");
  } else if (symbol === "sol") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    csvData_ = csvData.filter((data) => data.token_symbol === "SOL");
  } else {
    csvData_ = csvData;
  }

  await csvWriter.writeRecords(csvData_);
  const swalOptions = {
    position: "top-end",
    title: "Succesfully generated Csv",
    icon: "success",
    showConfirmButton: true,
    timer: 3000,
  };

  Alert.fireToast(swalOptions);
  return "Output file generated";
};
