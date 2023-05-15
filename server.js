const express = require("express");
const fs = require('fs')
const path = require('path')
const {NodeSSH} = require('node-ssh')
const multer = require("multer");

const app = express();

const Vics = new Map();

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

async function functionVicsUpdate(host, username, password) {
    const ssh = new NodeSSH();
  
    try {
      // SSH 연결 설정
      await ssh.connect({
        host: host, // 접속할 서버 주소
        username: username, // SSH 사용자 이름
        password: password // 서버 접속 비밀번호
      });
  
      
     await ssh.execCommand(`echo ${password} | sudo systemctl stop mivicsd.service`);
     console.log("mivics service stopped !!")

    // 로컬 파일 읽기
    const localFilePath = '/path/to/local/file'; // 로컬 파일 경로
    const localFileContent = fs.readFileSync(localFilePath);

    // 원격 서버로 파일 전송
    const remoteFilePath = '/path/to/remote/file'; // 원격 서버 파일 경로
    await ssh.putFile(localFilePath, remoteFilePath);

    console.log("file transfer end")

    await ssh.execCommand(`echo ${password} | sudo systemctl start mivicsd.service`);
    console.log("mivics service stopped !!")


    } catch (err) {
      console.error('오류:', err);
    } finally {
      // SSH 연결 종료
      ssh.dispose();
    }
}

async function updateVicsList() {
    try{
        for (const [key, value] of Vics) {
            await functionVicsUpdate(value.host, value.username, value.password);
        }
    } catch(err) {
        console.log(err);
    }
}

app.post("/start" , async (req,res) => {
    try{
        await updateVicsList();
        res.json({ message: "작업 완료"});
    } catch(err) {
        console.error("오류:", err);
        res.status(500).json({ error: "작업 실패" });
    }
})

app.post("/upload", upload.single("file"), (req, res) => {
    console.log("파일이 업로드되었습니다.");
    res.send("파일 업로드가 완료되었습니다.");
});

app.get("/vics" , (req,res) => {
    const myArray = Array.from(Vics);
    res.json(myArray);
})

app.post("/vics" , (req,res) => {
    const server =  {
        ip:req.body.ip,
        port:req.body.port,
        username:req.body.username,
        password:req.body.password, 
    }
    Vics.set(req.body.ip, server);
})

app.put("/vics" , (req,res) => {
    Vics.delete(req.body.ip);

    const server =  {
    ip:req.body.ip,
    port:req.body.port,
    username:req.body.username,
    password:req.body.password, 
}
    Vics.set(req.body.ip, server);
    res.json({ message: "작업 완료"});
})

app.delete("/vics" , (req,res) => {
    Vics.delete(req.body.ip);
    res.json({ message: "작업 완료"});
})

app.delete("/vicslist" , (req,res) => {
    Vics.clear();
})

app.listen(8000, () => {
    console.log("서버가 시작되었습니다.");
})