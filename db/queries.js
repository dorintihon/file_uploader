import { prisma } from "../lib/prisma.js";

async function getUserByUsername(username) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
}

async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

async function createUser(username, password) {
  const user = await prisma.user.create({
    data: { username, password },
  });
  return user;
}

export { getUserByUsername, findUserById, createUser };
