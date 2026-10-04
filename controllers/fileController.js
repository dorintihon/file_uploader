import { getFolderById, createFileInDB } from '../db/queries.js';
import multer from "multer";
import cloudinary from '../config/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage() });

async function addFileForm(req, res) {
    console.log("params:", req.params);

    const folderId = parseInt(req.params.folderId, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);

    if (!folder) {
        return res.status(404).send("Folder not found");
    }
    res.render("forms/addFile", { folder });
}

async function postUpload(req, res) {
    console.log("params:", req.params);
    const folderId = parseInt(req.params.folderId, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);

    if (!folder) {
        return res.status(404).send("Folder not found");
    }

    try {

        upload.single("uploaded_file")(req, res, async (err) => {
            if (err) {
                console.error("Error during file upload:", err);
                return res.status(500).send("Internal Server Error");
            }

            try {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "auto",
                        folder: `folders/${folderId}`
                    },
                    async (error, result) => {
                        if (error) {
                            console.error("Error uploading to Cloudinary:", error);
                            return res.status(500).send("Internal Server Error");
                        }

                        try {
                            await createFileInDB(
                                req.file.originalname,
                                req.file.mimetype,
                                result.secure_url,
                                folderId,
                                userId
                            );

                            console.log("File uploaded successfully:", result);

                            res.redirect(`/folders/${folderId}`);
                        } catch (error) {
                            console.error("Error saving file to database:", error);
                            res.status(500).send("Internal Server Error");
                        }
                    }
                );

                uploadStream.end(req.file.buffer);

            } catch (error) {
                console.error("Error uploading file:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function getFile(req, res) {
    const fileId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    try {
        const file = await getFileById(fileId, userId);
        if (!file) {
            return res.status(404).send("File not found");
        }
        res.render("forms/file", { file });
    } catch (error) {
        console.error("Error retrieving file:", error);
        res.status(500).send("Internal Server Error");
    }
}

export { addFileForm, postUpload, getFile };