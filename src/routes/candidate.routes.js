
const { } = require("../controllers/candidate.controller");

const express = require("express")
const router = express.Router()


router.post("/addCadidate", addCadidate);
router.put("/uploadPersoImage/:id", uploadPersoImage);

module.exports = router;
