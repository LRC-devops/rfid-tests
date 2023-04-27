const HID = require("node-hid");

const devices = HID.devices();
const deviceInfo = devices.find((device) => {
  return device.vendorId === 3111 || device.manufacturer === "RFIDeas";
});

const scanCodeToChar = {
  4: "a",
  5: "b",
  6: "c",
  7: "d",
  8: "e",
  9: "f",
  10: "g",
  11: "h",
  12: "i",
  13: "j",
  14: "k",
  15: "l",
  16: "m",
  17: "n",
  18: "o",
  19: "p",
  20: "q",
  21: "r",
  22: "s",
  23: "t",
  24: "u",
  25: "v",
  26: "w",
  27: "x",
  28: "y",
  29: "z",
  30: "1",
  31: "2",
  32: "3",
  33: "4",
  34: "5",
  35: "6",
  36: "7",
  37: "8",
  38: "9",
  39: "0",
  // Add any other scan codes and their corresponding characters as needed
};

const dataStream = {
  started: false,
  finished: false,
  results: [],
};

const relevantBytes = [];

// NOTE: LEFT OFF having discovered the exit code on byte 0 === 2x(64), use this to set finished and write data.
let dataStarted = false;
if (deviceInfo) {
  const device = new HID.HID(deviceInfo.path);
  let dataArr = [];
  device.on("data", (data) => {
    const scanCode = data[2];
    const exitCode = data[0];

    if (scanCode !== 0) {
      if (exitCode === 64) {
        dataStream.finished = true;
      }
      const char = scanCodeToChar[scanCode];
      if (char != "undefined" && char != null) {
        if (char !== "0") {
          dataStream.started = true;
        }
      } else {
        dataStream.started = false;
      }
      if (dataStream.started && !dataStream.finished) {
        dataArr.push(char);
      }

      if (dataStream.finished && dataArr.length > 0) {
        dataStream.results.push(dataArr.join(""));
        console.table(dataStream);
        dataArr = [];
      }
    }
  });

  device.on("error", (error) => {
    console.error(error);
  });
} else {
  console.error("No RFID device found");
}

const studentID = relevantBytes
  .map((scanCode) => scanCodeToChar[scanCode])
  .join("");
console.log(studentID);

process.on("SIGINT", () => {
  console.warn("Exiting...");
  console.log("Student ID: ", dataStream.data.join(""));
  process.exit(0);
});
