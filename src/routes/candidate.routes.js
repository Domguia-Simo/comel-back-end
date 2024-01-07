
const { addCandidate, uploadCandidateImage, deleteCandidate, editCandidates } = require("../controllers/candidate.controller");

const express = require("express")
const router = express.Router()


router.post("/addCandidate", addCandidate);
router.put("/editCandidate/:id", editCandidates);
router.put("/uploadPersoImage/:id", uploadCandidateImage);
router.delete("/deleteCandidate/:id", deleteCandidate);

module.exports = router;
