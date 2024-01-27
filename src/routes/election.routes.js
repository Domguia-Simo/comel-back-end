
const { getElections, createElection, startElection, closeElection, deleteElection, electionResult } = require("../controllers/election.controller");

const express = require("express");
const isLogin = require("../middleware/isLogin");
const router = express.Router()

router.get("/", (req, res) => {
    return res.send("Welcome to my node revision election")
})
router.get("/getElections", getElections)
router.post("/createElection", isLogin, createElection)
router.get("/closeElection/:id", isLogin, closeElection)
router.get("/startElection/:id", isLogin, startElection)
router.delete("/deleteElection/:id", isLogin, deleteElection)
router.get("/result/:id", electionResult)

module.exports = router;
