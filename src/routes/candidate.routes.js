
const { addCandidate, uploadCandidateImage, deleteCandidate, editCandidates, getCandidates } = require("../controllers/candidate.controller");

const express = require("express");
const isLogin = require("../middleware/isLogin");
const router = express.Router()


router.get("/getCandidates", getCandidates);
router.post("/addCandidate", isLogin, addCandidate);
router.put("/editCandidate/:id",isLogin, editCandidates);
router.put("/uploadPersoImage/:id",isLogin, uploadCandidateImage);
router.delete("/deleteCandidate/:id",isLogin, deleteCandidate);

module.exports = router;
