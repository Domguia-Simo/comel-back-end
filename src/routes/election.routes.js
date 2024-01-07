
const { getElections, createElection, startElection, closeElection, deleteElection } = require("../controllers/election.controller");

const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    return res.send("Welcome to my node revision election")
})
router.get("/getElections", getElections)
router.post("/createElection", createElection)
router.get("/closeElection", closeElection)
router.get("/startElection", startElection)
router.delete("/deleteElection/:id", deleteElection)

module.exports = router;
