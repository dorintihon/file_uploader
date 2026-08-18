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
      folder: true,
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

export { 
  getUserByUsername, 
  findUserById, 
  createUser
};
