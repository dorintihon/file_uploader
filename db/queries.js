import { prisma } from "../lib/prisma.js";


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
  const folder = await prisma.folder.deleteMany({
    where: {
      id: folderId,
      userId: userId
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

export {
  getUserByUsername,
  findUserById,
  createUser,
  getFolderById,
  deleteFolderById,
  createFolderInDB,
  editFolderNameInDB
};
