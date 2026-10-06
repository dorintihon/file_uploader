import { getFolderById, createFileInDB, getFileById, deleteFileById } from '../db/queries.js';
import multer from "multer";
import cloudinary from '../config/cloudinary.js';

const upload = multer({ storage: multer.memoryStorage() });
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function addFileForm(req, res) {
    // console.log("params:", req.params);

    const folderId = parseInt(req.params.folderId, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);

    if (!folder) {
        return res.status(404).send("Folder not found");
    }
    res.render("forms/addFile", { folder });
}

async function postUpload(req, res) {
    // console.log("params:", req.params);
    const folderId = parseInt(req.params.folderId, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);

    if (!folder) {
        return res.status(404).send("Folder not found");
    }

    try {

        upload.single("uploaded_file")(req, res, async (err) => {
            if (!req.file) {
                return res.status(400).send("No file uploaded");
            }
            
            if (err) {
                console.error("Error during file upload:", err);
                return res.status(500).send("Internal Server Error");
            }

            if (req.file.size > MAX_FILE_SIZE) {
                return res.status(400).send("File size exceeds 10MB limit");
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
                                {
                                    name: req.file.originalname,
                                    type: req.file.mimetype,
                                    url: result.secure_url,
                                    size: req.file.size,
                                    folderId,
                                    userId,
                                    publicId: result.public_id
                                }
                            );

                            // console.log("File uploaded successfully:", result);

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
    // console.log("params:", req.params);
    const fileId = parseInt(req.params.fileId, 10);
    const userId = req.user.id;
    const folderId = parseInt(req.params.folderId, 10);

    try {
        const file = await getFileById(fileId, userId, folderId);
        if (!file) {
            return res.status(404).send("File not found");
        }
        res.render("forms/file", { file, folderId });
    } catch (error) {
        console.error("Error retrieving file:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteFile(req, res) {
    // console.log("params:", req.params);
    const fileId = parseInt(req.params.fileId, 10);
    const userId = req.user.id;
    const folderId = parseInt(req.params.folderId, 10);

    try {
        await deleteFileById(fileId, userId, folderId);
        res.redirect(`/folders/${folderId}`);
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function downloadFile(req, res) {
  const fileId = Number(req.params.fileId);
  const folderId = Number(req.params.folderId);
  const userId = req.user.id;

  const file = await getFileById(fileId, userId, folderId);

  if (!file) {
    return res.status(404).send("File not found");
  }

  
  return res.redirect(file.url);
}

export { addFileForm, postUpload, getFile, deleteFile, downloadFile };