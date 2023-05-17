var express = require("express");
const router = express.Router();
const sshUpdater = require("../classes/sshupdater");

const vics = new Map();

async function updateVicsList() {
    try{
        for (const [key, value] of vics) {
            await value.vicsUpdate();
        }
    } catch(err) {
        console.log(err);
    }
}

router.get("/" , (req,res) => {
    const myArray = Array.from(vics);
    res.json(myArray);
})

router.post("/" , (req,res) => {
    vics.set(req.body.ip, new sshUpdater(req.body.ip,req.body.port, req.body.username, req.body.password));
})

router.put("/" , (req,res) => {
    vics.delete(req.body.ip);
    vics.set(req.body.ip, new sshUpdater(req.body.ip,req.body.port, req.body.username, req.body.password));
    res.json({ message: "작업 완료"});
})

router.delete("/" , (req,res) => {
    vics.delete(req.body.ip);
    res.json({ message: "작업 완료"});
})

router.delete("/list" , (req,res) => {
    vics.clear();
    res.json({ message: "작업 완료"});
})

router.post("/start" , async (req,res) => {
    try{
        await updateVicsList();
        res.json({ message: "작업 완료"});
    } catch(err) {
        console.error("오류:", err);
        res.status(500).json({ error: "작업 실패" });
    }
})

module.exports = router;