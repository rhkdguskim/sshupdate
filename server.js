const express = require("express");
const multer = require("multer");
const vics = require("./routes/vics");
const app = express();

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
    destination: "uploads/", // 파일이 저장될 경로
    filename: function (req, file, cb) {
      // 파일 이름 설정
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

const upload = multer({ storage });

app.use("/vics", vics);

app.post("/upload", upload.single("file"), (req, res) => {
    console.log("파일이 업로드되었습니다.");
    res.send("파일 업로드가 완료되었습니다.");
});

app.listen(8000, () => {
    console.log("서버가 시작되었습니다.");
})