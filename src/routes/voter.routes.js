
const { getVoters, Votes, validateVotes, VotesByAdmin, getVoterByClass, createVoter } = require("../controllers/voter.controller");

const express = require("express")
const router = express.Router()


router.get("/getAllVoter", getVoters)
router.post("/getVoterByClass", getVoterByClass)
router.post("/createVoter", createVoter)
router.post("/votes", Votes)
router.post("/validateVotes", validateVotes)
router.post("/votesByAdmin", VotesByAdmin)

module.exports = router;
