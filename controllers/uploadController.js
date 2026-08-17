import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

async function postUpload(req, res) {
    upload.single("uploaded_file")(req, res, (err) => {
        if (err) {
            console.error("Error during file upload:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("File uploaded successfully:", req.file);
        res.redirect("/");
    });
}

export { postUpload };