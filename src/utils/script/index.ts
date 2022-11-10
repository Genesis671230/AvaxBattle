/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { createObjectCsvWriter } from "csv-writer";
import { csvHeaders } from "../constants";
import { createCsvObject } from "../factory";
import { IAllowedArguments, IJsonCsvData } from "../types";
import { getSignaturesByTime } from "../utils/getSignatures";
import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Alert = require("electron-alert");

export const createCsv = async (
  params: IAllowedArguments,
  jsonCsvData: IJsonCsvData[]
): Promise<any> => {
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
  fs.unlink("output.csv", function (err) {
    if (err && err.code == "ENOENT") {
      // file doens't exist
      console.info("File doesn't exist, won't remove it.");
    } else if (err) {
      // other errors, e.g. maybe we don't have enough permission
      console.error("Error occurred while trying to remove file");
    } else {
      console.info(`removed`);
    }
  });
  console.log("address_", address_);

  if (pullDataBy === "tag" || pullDataBy === "group") {
    //@ts-ignore
    if (address_.length === 0) {
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
  // @TODO replace the below with the provied rpc end point
  // const solanaClient = new Connection(clusterApiUrl("mainnet-beta"));
  const solanaClient = new Connection(
    "https://winter-powerful-grass.solana-mainnet.discover.quiknode.pro/c345c5ce167f0bb90a02987a43d0437fb8bca37e/"
  );

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
            .message.instructions) {
            let feeShown = false;
            if (transactionDetails.meta?.innerInstructions) {
              for (const innerTransaction of transactionDetails.meta
                ?.innerInstructions) {
                if (index === innerTransaction.index) {
                  let innerIndex = 0;
                  for (const instruction of innerTransaction.instructions) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { parsed } = instruction as any;

                    innerIndex++;
                    const number = `${
                      innerTransaction.index + 1
                    }.${innerIndex}`;

                    if (
                      (parsed &&
                        (parsed.type === "transfer" ||
                          parsed.type === "createAccount" ||
                          parsed.type === "mintTo")) ||
                      //@ts-ignore
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { parsed } = instruction as any;
            if (
              (parsed &&
                (parsed.type === "transfer" ||
                  parsed.type === "createAccount" ||
                  parsed.type === "transferChecked" ||
                  parsed.type === "mintTo")) ||
              //@ts-ignore
              (instruction.program === "system" && parsed.info.lamports) ||
              //@ts-ignore
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
            .message.instructions) {
            if (transactionDetails.meta?.innerInstructions) {
              for (const innerTransaction of transactionDetails.meta
                ?.innerInstructions) {
                if (index === innerTransaction.index) {
                  let innerIndex = 0;
                  for (const instruction of innerTransaction.instructions) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { parsed } = instruction as any;

                    innerIndex++;
                    const number = `${
                      innerTransaction.index + 1
                    }.${innerIndex}`;

                    if (
                      (parsed &&
                        (parsed.type === "transfer" ||
                          parsed.type === "createAccount" ||
                          parsed.type === "mintTo")) ||
                      //@ts-ignore
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { parsed } = instruction as any;
            if (
              (parsed &&
                (parsed.type === "transfer" ||
                  parsed.type === "createAccount" ||
                  parsed.type === "transferChecked" ||
                  parsed.type === "mintTo")) ||
              //@ts-ignore
              (instruction.program === "system" && parsed.info.lamports) ||
              //@ts-ignore
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
    //@ts-ignore
    csvData_ = csvData.filter((data) => data.token_symbol === "MBS");
  } else if (symbol === "sol") {
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
