
const { getVoters, Votes, validateVotes, VotesByAdmin, getVoterByClass, createVoter, VotesNTimes } = require("../controllers/voter.controller");

const express = require("express");
const isLogin = require("../middleware/isLogin");
const router = express.Router()


// router.get("/getAllVoter", isLogin, getVoters)
router.post("/Votes", VotesNTimes)
// router.get("/getVoterByClass/:classes", isLogin, getVoterByClass)
// router.post("/createVoter", createVoter)
// router.post("/votes", Votes)
// router.post("/validateVotes", validateVotes)
// router.post("/votesByAdmin", VotesByAdmin)

module.exports = router;

