
const { addCandidate, uploadCandidateImage, deleteCandidate, editCandidates, getCandidates, getCandidateByElection, createCandidateM } = require("../controllers/candidate.controller");

const express = require("express");
const isLogin = require("../middleware/isLogin");
const router = express.Router()

router.post("/createCandidateM", createCandidateM)
router.get("/getCandidates", getCandidates);
router.get("/getCandidateByElection/:id", getCandidateByElection);
router.post("/addCandidate", isLogin, addCandidate);
router.put("/editCandidate/:id",isLogin, editCandidates);
router.put("/uploadPersoImage/:id",isLogin, uploadCandidateImage);
router.delete("/deleteCandidate/:id",isLogin, deleteCandidate);

module.exports = router;
