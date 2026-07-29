const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const allOtps = await prisma.loginOtp.findMany({});
  console.log("All OTPs:", JSON.stringify(allOtps));
}
main().catch(err => {
  console.error(err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
