import { prisma } from "../lib/prisma.js";

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      username: "gimiri",
    },
    include: {
      folder: true,
    },
  });

  if (!user) {
    console.log("User not found");
    return;
  }


  console.log(user);
}

async function createTestFolderForUser(username) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  const folder = await prisma.folder.create({
    data: {
      name: "My Test Folder",
      userId: user.id,
    },
  });

  console.log(`Folder created for user ${username}:`, folder);
}

async function deleteTestFolderForUser(username, id) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      folder: true,
    },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  if (!user.folder) {
    console.log("No folder found for user");
    return;
  }

  await prisma.folder.delete({
    where: {
      id: id,
    },
  });

  console.log(`Folder deleted for user ${username}`);
}

// Example usage:
// deleteTestFolderForUser("gimiri", 1);


main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

