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

export { getUserByUsername, findUserById };
