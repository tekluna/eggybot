export async function getUser(prisma, id) {
  const result = await prisma.user.findUnique({
    where: { discord_id: id }
  });
  await prisma.$disconnect();
  return result;
}

export async function createUser(prisma, data) {
  const result = await prisma.user.create({
    data
  });
  await prisma.$disconnect();
  return result;
}

export async function updateUser(prisma, id, data) {
  const result = await prisma.user.update({
    data,
    where: { discord_id: id }
  });
  await prisma.$disconnect();
  return result;
}

export async function deleteUser(prisma, id) {
  const result = await prisma.user.delete({where: {id}});
  await prisma.$disconnect();
  return result;
}