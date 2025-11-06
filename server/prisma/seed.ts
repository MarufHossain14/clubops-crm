import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  // Prefer TRUNCATE ... RESTART IDENTITY CASCADE for deterministic IDs
  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "ProjectTeam","TaskAssignment","Attachment","Comment","Task","User","Project","Team" RESTART IDENTITY CASCADE;'
    );
    console.log("Cleared all tables with TRUNCATE ... RESTART IDENTITY CASCADE");
  } catch (error) {
    console.error("Error truncating tables, falling back to deleteMany:", error);

    const modelNames = orderedFileNames.map((fileName) => {
      const base = path.basename(fileName, path.extname(fileName));
      const mapped = mapFileBaseToModel(base);
      return mapped.charAt(0).toUpperCase() + mapped.slice(1);
    });

    for (const modelName of modelNames) {
      const model: any = prisma[modelName as keyof typeof prisma];
      try {
        await model.deleteMany({});
        console.log(`Cleared data from ${modelName}`);
      } catch (err) {
        console.error(`Error clearing data from ${modelName}:`, err);
      }
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "team.json",
    "project.json",
    "projectTeam.json",
    "user.json",
    "tasks.json",
    "attachment.json",
    "comment.json",
    "taskAssignment.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = mapFileBaseToModel(path.basename(fileName, path.extname(fileName)));
    const model: any = prisma[modelName as keyof typeof prisma];

    try {
      for (const raw of jsonData) {
        const data = transformForModel(modelName, raw);
        await model.create({ data });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

function transformForModel(modelName: string, raw: any) {
  const clone = { ...raw };

  // Drop generic auto-increment ids across models
  delete (clone as any).id;

  switch (modelName) {
    case "team": {
      delete clone.createdAt;
      return clone;
    }
    case "user": {
      // Prisma model uses userId autoincrement; do not supply
      delete clone.userId;
      // Not in schema
      delete clone.email;
      if (clone.teamId != null) {
        const teamId = clone.teamId;
        delete clone.teamId;
        clone.team = { connect: { id: teamId } };
      }
      return clone;
    }
    case "project": {
      return clone;
    }
    case "projectTeam": {
      return clone;
    }
    case "tasks": {
      // file is tasks.json but model is Task
      return clone;
    }
    case "attachment": {
      return clone;
    }
    case "comment": {
      return clone;
    }
    case "taskAssignment": {
      return clone;
    }
    default:
      return clone;
  }
}

function mapFileBaseToModel(base: string): string {
  if (base === "tasks") return "task";
  return base;
}
