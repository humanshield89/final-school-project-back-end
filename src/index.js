const dotenv = require("dotenv");
const express = require("express");
dotenv.config();
const db = require("./db");
const routes = require("./routes");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { prepareS3, uploadToS3, generatePermanentURL } = require("./s3");
async function main() {
  await db.connect();

  await prepareS3();

  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use(fileUpload({}));

  app.post("/test-upload", async (req, res, next) => {
    console.log(req.files);

    const image = req.files.image;

    const path =
      "uploads/" + image.md5 + "." + image.name.split(".")?.[1] || "";

    await image.mv(path);

    res.send("http://localhost:1300/" + path);
  });

  app.post("/test-upload-s3", async (req, res, next) => {
    console.log(req.files);
    const image = req.files.image;

    const path = "public/" + image.md5 + "." + image.name.split(".")?.[1] || "";

    console.log(image.data);

    await uploadToS3(image.data, path);

    res.json({
      status: "success",
      url: generatePermanentURL(path),
    });
  });

  app.use("/uploads", express.static("uploads"));

  routes(app);

  app.listen(process.env.PORT, () => {
    console.log(`server runing on port ${process.env.PORT}`);
  });
}
main();
