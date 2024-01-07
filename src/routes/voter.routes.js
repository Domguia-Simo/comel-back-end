
const { Votes, validateVotes, VotesByAdmin } = require("../controllers/voter.controller");

const express = require("express")
const router = express.Router()


router.get("/votes", Votes)
router.get("/validateVotes", validateVotes)
router.get("/votesByAdmin", VotesByAdmin)

module.exports = router;
