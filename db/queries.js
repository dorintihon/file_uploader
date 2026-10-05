import { prisma } from "../lib/prisma.js";
import { v2 as cloudinary } from "cloudinary";


async function getUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      folder: true,
    },
  });
  console.log(`getUserByUsername: Found user: ${user ? user.username : 'None'}`);
  return user;
}

async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      folder: {
        orderBy: {
          id: 'asc',
        },
      }
    },
  });
  return user;
}

async function createUser(username, password) {
  const user = await prisma.user.create({
    data: { username, password },
  });
  return user;
}


//Folders

async function getFolderById(folderId, userId) {
  const folder = await prisma.folder.findFirst({
    where: { 
      id: folderId,
      userId: userId
    },
    include: {
      files: true,
    },
  });
  return folder;
}

async function createFolderInDB(name, userId) {
  const folder = await prisma.folder.create({
    data: {
      name,
      userId,
    },
  });
  return folder;
}

async function deleteFolderById(folderId, userId) {

  const files = await prisma.file.findMany({
    where: {
      folderId,
      userId
    }
  });

  // 1. Delete files from Cloudinary
  for (const file of files) {
    await deleteFileFromCloudinary(file.publicId);
  }

  // 2. Delete the now-empty Cloudinary folder
  await deleteFolderFromCloudinary(folderId);

  // 3. Delete file records from database
  await prisma.file.deleteMany({
    where: {
      folderId,
      userId
    }
  });

  // 4. Delete folder from database
  const folder = await prisma.folder.deleteMany({
    where: {
      id: folderId,
      userId
    }
  });

  return folder;
}

async function editFolderNameInDB(folderId, userId, newName) {  
  const folder = await prisma.folder.updateMany({
    where: {
      id: folderId,
      userId: userId
    },
    data: {
      name: newName
    }
  });
  return folder;
}

// Files

async function createFileInDB({
    name,
    type,
    url,
    folderId,
    userId,
    size,
    publicId
}) {
    console.log("Creating file:", {
        userId,
        folderId,
        name
    });

    const file = await prisma.file.create({
        data: {
            name,
            type,
            url,
            folderId,
            userId,
            size,
            publicId
        }
    });

    return file;
}

async function getFileById(fileId, userId, folderId) {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId: userId,
      folderId: folderId  
    }
  });
  console.log(`the file is: ${file ? file.name : 'None'} and it was created at ${file ? file.createdAt : 'N/A'}`);
  return file;

}

async function deleteFileById(fileId, userId, folderId) {
  // 1. Find the file and verify it belongs to this user/folder
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
      folderId
    }
  });

  if (!file) {
    throw new Error("File not found");
  }

  // 2. Delete the actual file from Cloudinary
  await deleteFileFromCloudinary(file.publicId);
  

  // 3. Delete the database record
  await prisma.file.delete({
    where: {
      id: file.id
    }
  });

  return file;
}


// Cloudinary helper function
async function deleteFileFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted file from Cloudinary:", result);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
  }
}

async function deleteFolderFromCloudinary(folderId) {
  try {
    const folderPath = `folders/${folderId}`;
    const result = await cloudinary.api.delete_folder(folderPath);
    console.log("Deleted folder from Cloudinary:", result);
  } catch (error) {
    // Folder already doesn't exist — that's okay
    if (error.error?.http_code === 404) {
      console.log("Cloudinary folder already deleted.");
      return null;
    }
    
    console.error("Error deleting folder from Cloudinary:", error);
  }
}

export {
  getUserByUsername,
  findUserById,
  createUser,
  getFolderById,
  deleteFolderById,
  createFolderInDB,
  editFolderNameInDB,
  createFileInDB,
  getFileById,
  deleteFileById
};

