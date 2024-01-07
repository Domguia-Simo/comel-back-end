
const { getElections, createElection, startElection, closeElection } = require("../controllers/election.controller");

const express = require("express")
const router = express.Router()

router.get("/",(req ,res)=>{
    return res.send("Welcome to my node revision election")
})
router.get("/getElections", getElections)
router.get("/createElection", createElection)
router.get("/closeElection", closeElection)
router.get("/startElection", startElection)

module.exports = router;
