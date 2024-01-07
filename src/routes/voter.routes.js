
const { Votes, validateVotes, VotesByAdmin } = require("../controllers/voter.controller");

const express = require("express")
const router = express.Router()


router.post("/votes", Votes)
router.post("/validateVotes", validateVotes)
router.post("/votesByAdmin", VotesByAdmin)

module.exports = router;
