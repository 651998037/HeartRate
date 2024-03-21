const moment = require("moment");
const controller = {};
const { name } = require("ejs");
const { validationResult } = require("express-validator");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");
const token =
  "lTN52-auVHuzQD-jyUZplsnnBcslIt9S0AN0kCLR-812r7J2u99Zm4oBZ4C8G5kBWfDd5DtKDkRPu2J6T7kVKQ==";
const url = "https://eu-central-1-1.aws.cloud2.influxdata.com";
const client = new InfluxDB({ url, token });
let org = `e266c442dcee6ac5`;
let bucket = `THESABAN`;

let writeClient = client.getWriteApi(org, bucket, "ns");

// let point = new Point('dashboard37')
// // .tag('device','abc')
// .intField('IR', 99);
// void setTimeout(() => {
// writeClient.writePoint(point)
// }, 1000) // separate points by 1 second
// void setTimeout(() => {
// writeClient.flush()
// }, 5000)

controller.Dist = async (req, res) => {
  let IRvalue = null;
  let BPMvalue = null; // เพิ่มการประกาศ Rvalue ที่นี่
  let AvgBPMvalue = null; // เพิ่มการประกาศ Rvalue ที่นี่

  try {
    const queryClient = client.getQueryApi(org);

    const fluxQuery = `from(bucket: "THESABAN")
          |> range(start: -1m)
          |> filter(fn: (r) => r["device"] == "8:f9:e0:6c:55:93")
          |> filter(fn: (r) => r._measurement == "HeartRate" and (r["_field"] == "IR" or r["_field"] == "BPM" or r["_field"] == "AvgBPM")) // เพิ่มการกรองเพื่อเลือกค่า Sonic และ R
        |> last()`;

    await new Promise((resolve, reject) => {
      queryClient.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const tableObject = tableMeta.toObject(row);
          console.log(tableObject._value);
          if (tableObject._field === "IR") {
            IRvalue = tableObject._value;
          } else if (tableObject._field === "BPM") {
            BPMvalue = tableObject._value;
          } else if (tableObject._field === "AvgBPM") {
            AvgBPMvalue = tableObject._value;
          }
        },
        error: (error) => {
          console.error("\nError", error);
          reject(error);
        },
        complete: () => {
          resolve();
        },
      });
    });

    if (IRvalue !== null) {
      const point = new Point("THESABAN").intField("IR", IRvalue);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      writeClient.writePoint(point);

      await new Promise((resolve) => setTimeout(resolve, 4000));
      writeClient.flush();
    }

    res.render("Dist", { data: { IRvalue, BPMvalue, AvgBPMvalue } }); // ส่ง Sonicvalue และ Rvalue ไปยังหน้าเว็บ
  } catch (error) {
    console.error("Error", error);
    res.render("Dist", { data: { IRvalue, BPMvalue, AvgBPMvalue } }); // ส่ง Sonicvalue และ Rvalue ไปยังหน้าเว็บ
  }
};


controller.graph = async (req, res) => {
    let IRData = []; // Declare IRData array
    let BPMData = []; // Declare BPMData array
    let AvgBPMData = []; // Declare AvgBPMData array

    try {
        const queryClient = client.getQueryApi(org);

        const fluxQuery = `
            from(bucket: "THESABAN")
            |> range(start: -1y)
            |> filter(fn: (r) => r["device"] == "8:f9:e0:6c:55:93")
            |> filter(fn: (r) => r._measurement == "HeartRate" and (r["_field"] == "IR" or r["_field"] == "BPM" or r["_field"] == "AvgBPM"))
        `;

        await new Promise((resolve, reject) => {
            queryClient.queryRows(fluxQuery, {
                next: (row, tableMeta) => {
                    const tableObject = tableMeta.toObject(row);
                    tableObject.time = new Date(tableObject._time).toLocaleString(); // Add date and time information

                    if (tableObject._field === "IR") {
                        IRData.push(tableObject);
                        // console.log("IRvalue:", tableObject._value);
                    } else if (tableObject._field === "BPM") {
                        BPMData.push(tableObject);
                        // console.log("BPMvalue:", tableObject._value);
                    } else if (tableObject._field === "AvgBPM") {
                        AvgBPMData.push(tableObject);
                        // console.log("AvgBPMvalue:", tableObject._value);
                    }

                   

                },
                error: (error) => {
                    console.error("\nError", error);
                    reject(error);
                },
                complete: () => {
                    // Render the view with the complete data
                    resolve();
                },
            });
        });

        res.render("graph", { IRData, BPMData, AvgBPMData });
    } catch (error) {
        console.error("Error", error);
        res.render("graph", { IRData, BPMData, AvgBPMData });

    }
};



// controller.graph2 = async (req, res) => {
//   let IRData = []; // Declare IRData array
//   let BPMData = []; // Declare BPMData array
//   let AvgBPMData = []; // Declare AvgBPMData array

//   try {
//       const queryClient = client.getQueryApi(org);

//       const fluxQuery = `
//           from(bucket: "THESABAN")
//           |> range(start: -1y)
//           |> filter(fn: (r) => r["device"] == "8:f9:e0:6c:55:93")
//           |> filter(fn: (r) => r._measurement == "HeartRate" and (r["_field"] == "IR" or r["_field"] == "BPM" or r["_field"] == "AvgBPM"))
//       `;

//       await new Promise((resolve, reject) => {
//           queryClient.queryRows(fluxQuery, {
//               next: (row, tableMeta) => {
//                   const tableObject = tableMeta.toObject(row);
//                   tableObject.time = new Date(tableObject._time).toLocaleString(); // Add date and time information

//                   if (tableObject._field === "IR") {
//                       IRData.push(tableObject);
//                       // console.log("IRvalue:", tableObject._value);
//                   } else if (tableObject._field === "BPM") {
//                       BPMData.push(tableObject);
//                       // console.log("BPMvalue:", tableObject._value);
//                   } else if (tableObject._field === "AvgBPM") {
//                       AvgBPMData.push(tableObject);
//                       // console.log("AvgBPMvalue:", tableObject._value);
//                   }

                 

//               },
//               error: (error) => {
//                   console.error("\nError", error);
//                   reject(error);
//               },
//               complete: () => {
//                   // Render the view with the complete data
//                   resolve();
//               },
//           });
//       });

//       res.render("graph2", { IRData, BPMData, AvgBPMData });
//   } catch (error) {
//       console.error("Error", error);
//       res.render("graph2", { IRData, BPMData, AvgBPMData });

//   }
// };





module.exports = controller;
