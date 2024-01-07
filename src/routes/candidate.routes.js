
const { } = require("../controllers/candidate.controller");

const express = require("express")
const router = express.Router()


router.get("/votes", Votes);

module.exports = router;
