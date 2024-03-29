const Candidate = require("../models/candidate");
const adminModel = require('../models/Admin.js');
const Election = require("../models/Election");


exports.getCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find();
        console.log(candidates)
        const elections = await Election.findOne({ _id: candidates[0].election });
        console.log(elections)
        return res.status(200).json({ candidates: candidates, elections: elections });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.addCandidate = async (req, res) => {
    try {
        console.log(req.body)
        let admin = await adminModel.findOne({ _id: req.Id })
        if (admin) {
            if (admin.accountType === "SuperAdmin") {
                let candidateModel = {
                    name: req.body.name,
                    email: req.body.email,
                    desc: req.body.desc,
                    phone: req.body.phone,
                    class: req.body.class,
                    election: req.body.election,
                    createdById: req.Id,
                    createdByName: req.UserName
                }
                const existingCandidate = await Candidate.findOne({ 'email': candidateModel.email });
                if (existingCandidate) {
                    return res.status(409).send({ message: 'Candidate Email already in use.', status: false });
                }
                const candidate = new Candidate(candidateModel)
                console.log(candidate)
                await candidate.save()
                    .then(async respond => {
                        console.log(respond)
                        return res.status(200).json({ message: "Candidate created successfully", status: true });
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(409).json({ message: 'check you connection', status: false });
                    })
            } else {
                return res.status(400).json({ message: 'Acess Denied' });
            }
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', status: false });
    }
};
exports.editCandidates = async (req, res) => {
    try {
        let id = req.body.id || req.params.id;
        console.log(req.body)
        let admin = await adminModel.findOne({ _id: req.Id })
        if (admin) {
            if (admin.accountType === "SuperAdmin") {
                let candidateModel = {
                    name: req.body.name,
                    email: req.body.email,
                    desc: req.body.desc,
                    phone: req.body.phone,
                    class: req.body.class,
                    election: req.body.election,
                    createdById: req.Id,
                    createdByName: req.UserName
                }
                await Candidate.findOneAndUpdate({ _id: id }, {
                    'name': candidateModel.name,
                    'email': candidateModel.email,
                    'desc': candidateModel.desc,
                    'phone': candidateModel.phone,
                    'class': candidateModel.class,
                    'election': candidateModel.election
                })
                    .then(async respond => {
                        console.log(respond)
                        return res.status(200).json({ message: "Candidate updated successfully", status: true });
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(409).json({ message: 'check you connection', status: false });
                    })
            } else {
                return res.status(400).json({ message: 'Acess Denied' });
            }
        } else {
            return res.status(400).json({ message: 'Acess Denied' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', status: false });
    }
};
exports.uploadCandidateImage = async (req, res) => {
    const id = req.params.id;
    let imageFiles = req.files.images; // Assuming 'images' is the fieldname for the files
    console.log(imageFiles);
    console.log(req.params.id);
    try {
        const candidate = await Candidate.findOne({ _id: id });
        console.log('candidate found:', candidate);
        if (!imageFiles) {
            return res.status(400).send('No files were uploaded.');
        }
        const currentDir = process.cwd();
        console.log("currentDir", currentDir);
        const uploadDir = path.join(currentDir, 'Candidate', 'files', `${personnels._id}`);
        const thumbnailDir = path.join(currentDir, 'Candidate', 'thumbnails', `${personnels._id}`);
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.mkdirSync(thumbnailDir, { recursive: true });
        console.log("good here");
        if (!Array.isArray(imageFiles)) {
            imageFiles = [imageFiles];
        }
        for (const file of imageFiles) {
            if (!file.mimetype.startsWith('image/')) {
                return res.status(400).send('Invalid file type. Only image files are allowed.');
            }

            const uploadPath = path.join(uploadDir, file.name);
            await file.mv(uploadPath);
            candidate.photo = file.name;
        }

        // Update the activity in the database
        await candidate.save()
            .then(async respond => {
                console.log(respond)
                res.status(200).send({ message: 'Images uploaded and image names saved to the DB successfully.' });
            })
            .catch(err => {
                console.log(err)
                return res.status(409).json({ message: 'check you connection' });
            })

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'An error occurred while processing images.' });
    }
};

exports.deleteCandidate = async (req, res) => {
    let id = req.body.id || req.params.id;
    let admin = await adminModel.findOne({ _id: req.Id })
    console.log(admin)
    if (admin) {
        if (admin.accountType === "SuperAdmin") {
            await Candidate.findByIdAndDelete(id)
                .then((result) => {
                    return res.status(200).send({ message: 'Candidate deleted successfully', status: true });
                })
                .catch((err) => {
                    return res.status(400).json({ message: "an error occur while deleting", status: false })
                })
        } else {
            return res.status(400).json({ message: 'Acess Denied2' });
        }
    } else {
        return res.status(400).json({ message: 'Acess Denied1' });
    }
};