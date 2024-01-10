
const { addCandidate, uploadCandidateImage, deleteCandidate, editCandidates, getCandidates } = require("../controllers/candidate.controller");

const express = require("express");
const isLogin = require("../middleware/isLogin");
const router = express.Router()


router.get("/getCandidates", getCandidates);
router.post("/addCandidate", isLogin, addCandidate);
router.put("/editCandidate/:id",isLogin, editCandidates);
router.put("/uploadPersoImage/:id", uploadCandidateImage);
router.delete("/deleteCandidate/:id", deleteCandidate);

module.exports = router;
