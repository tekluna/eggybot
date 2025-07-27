export async function getTictactoe(prisma, id) {
  const result = await prisma.tictactoe.findUnique({
    where: { id }
  });
  await prisma.$disconnect();
  return result;
}

export async function createTictactoe(prisma, data) {
  const result = await prisma.tictactoe.create({
    data
  });
  await prisma.$disconnect();
  return result;
}

export async function updateTictactoe(prisma, id, data) {
  const result = await prisma.tictactoe.update({
    data,
    where: { id }
  });
  await prisma.$disconnect();
  return result;
}

export async function deleteTictactoe(prisma, id) {
  const result = await prisma.tictactoe.delete({where: { id }});
  await prisma.$disconnect();
  return result;
}