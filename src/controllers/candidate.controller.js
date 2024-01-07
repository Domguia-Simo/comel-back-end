const Candidate = require("../models/candidate");


exports.addCadidate = async (req, res) => {
    try {
        console.log(req.body)
        let candidateModel = {
            name: req.body.name,
            email: req.body.email,
            desc: req.body.class,
            phone: req.body.level,
            class: req.body.candidate,
        }
        const existingCandidate = await Candidate.findOne({ 'email': candidateModel.email });
        if (existingCandidate) {
            return res.status(409).send({ message: 'Candidate Email already in use.' });
        }
        // if (voters) {

        const candidate = new Candidate(newBody)
        await candidate.save()
            .then(async respond => {
                console.log(respond)
                return res.status(200).json({ message: "Candidate created successfully" });
            })
            .catch(err => {
                console.log(err)
                return res.status(409).json({ message: 'check you connection' });
            })


        // } else {
        //     return res.status(408).json({ message: 'Enter correct creatidential' });
        // }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadPersoImage = async (req, res) => {
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