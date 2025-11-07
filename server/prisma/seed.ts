import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function deleteAllData() {
  // Prefer TRUNCATE ... RESTART IDENTITY CASCADE for deterministic IDs
  try {
    await prisma.$executeRawUnsafe(
      'TRUNCATE TABLE "Attachment","Note","VolunteerTask","RSVP","Sponsor","Event","Member","Org" RESTART IDENTITY CASCADE;'
    );
    console.log("Cleared all tables with TRUNCATE ... RESTART IDENTITY CASCADE");
  } catch (error) {
    console.error("Error truncating tables, falling back to deleteMany:", error);

    // Delete in reverse order of dependencies
    const modelNames = [
      "Attachment",
      "Note",
      "VolunteerTask",
      "RSVP",
      "Sponsor",
      "Event",
      "Member",
      "Org",
    ];

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

  // Order matters: seed parent tables before child tables
  const orderedFileNames = [
    "orgs.json",
    "members.json",
    "events.json",
    "sponsors.json",
    "rsvps.json",
    "volunteerTasks.json",
    "notes.json",
    "attachments.json",
  ];

  await deleteAllData();

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping...`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = mapFileBaseToModel(path.basename(fileName, path.extname(fileName)));
    const model: any = prisma[modelName as keyof typeof prisma];

    try {
      for (const raw of jsonData) {
        const data = transformForModel(modelName, raw);
        // Use create with explicit id to preserve seed data relationships
        await model.create({
          data: {
            ...data,
            id: raw.id, // Preserve the ID from seed data
          }
        });
      }
      console.log(`✅ Seeded ${modelName} with ${jsonData.length} records from ${fileName}`);
    } catch (error) {
      console.error(`❌ Error seeding data for ${modelName} from ${fileName}:`, error);
      throw error;
    }
  }

  // Reset sequences to start after the highest IDs we inserted
  // This ensures future auto-generated IDs don't conflict
  try {
    await prisma.$executeRawUnsafe(`
      SELECT setval(pg_get_serial_sequence('"Org"', 'id'), COALESCE((SELECT MAX(id) FROM "Org"), 1), true);
      SELECT setval(pg_get_serial_sequence('"Member"', 'id'), COALESCE((SELECT MAX(id) FROM "Member"), 1), true);
      SELECT setval(pg_get_serial_sequence('"Event"', 'id'), COALESCE((SELECT MAX(id) FROM "Event"), 1), true);
      SELECT setval(pg_get_serial_sequence('"Sponsor"', 'id'), COALESCE((SELECT MAX(id) FROM "Sponsor"), 1), true);
      SELECT setval(pg_get_serial_sequence('"RSVP"', 'id'), COALESCE((SELECT MAX(id) FROM "RSVP"), 1), true);
      SELECT setval(pg_get_serial_sequence('"VolunteerTask"', 'id'), COALESCE((SELECT MAX(id) FROM "VolunteerTask"), 1), true);
      SELECT setval(pg_get_serial_sequence('"Note"', 'id'), COALESCE((SELECT MAX(id) FROM "Note"), 1), true);
      SELECT setval(pg_get_serial_sequence('"Attachment"', 'id'), COALESCE((SELECT MAX(id) FROM "Attachment"), 1), true);
    `);
    console.log("✅ Reset database sequences");
  } catch (error) {
    console.warn("⚠️  Could not reset sequences (this is okay if tables are empty):", error);
  }

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());

function transformForModel(modelName: string, raw: any) {
  const clone = { ...raw };

  // Preserve IDs from seed data for relation mapping
  // We'll use create with explicit id values

  switch (modelName) {
    case "org": {
      // Convert createdAt string to Date if present
      if (clone.createdAt) {
        clone.createdAt = new Date(clone.createdAt);
      }
      return clone;
    }

    case "member": {
      // Convert lastSeenAt string to Date if present
      if (clone.lastSeenAt) {
        clone.lastSeenAt = new Date(clone.lastSeenAt);
      }
      // Connect to org
      const orgId = clone.orgId;
      delete clone.orgId;
      clone.org = { connect: { id: orgId } };
      return clone;
    }

    case "event": {
      // Convert DateTime strings to Date objects
      clone.startsAt = new Date(clone.startsAt);
      clone.endsAt = new Date(clone.endsAt);
      // Connect to org
      const orgId = clone.orgId;
      delete clone.orgId;
      clone.org = { connect: { id: orgId } };
      return clone;
    }

    case "sponsor": {
      // Convert Decimal values
      if (clone.pledged != null) {
        clone.pledged = new Decimal(clone.pledged);
      }
      if (clone.received != null) {
        clone.received = new Decimal(clone.received);
      }
      // Connect to org
      const orgId = clone.orgId;
      delete clone.orgId;
      clone.org = { connect: { id: orgId } };
      return clone;
    }

    case "rsvp": {
      // Connect to event and member
      const eventId = clone.eventId;
      const memberId = clone.memberId;
      delete clone.eventId;
      delete clone.memberId;
      clone.event = { connect: { id: eventId } };
      clone.member = { connect: { id: memberId } };
      return clone;
    }

    case "volunteerTask": {
      // Convert dueAt string to Date if present
      if (clone.dueAt) {
        clone.dueAt = new Date(clone.dueAt);
      }
      // Connect to event
      const eventId = clone.eventId;
      delete clone.eventId;
      clone.event = { connect: { id: eventId } };
      // Connect to assignee if present
      if (clone.assigneeMemberId != null) {
        const assigneeMemberId = clone.assigneeMemberId;
        delete clone.assigneeMemberId;
        clone.assignee = { connect: { id: assigneeMemberId } };
      }
      return clone;
    }

    case "note": {
      // Convert createdAt string to Date if present
      if (clone.createdAt) {
        clone.createdAt = new Date(clone.createdAt);
      }
      // Connect to author
      const authorMemberId = clone.authorMemberId;
      delete clone.authorMemberId;
      clone.author = { connect: { id: authorMemberId } };
      // Connect to volunteerTask if present
      if (clone.volunteerTaskId != null) {
        const volunteerTaskId = clone.volunteerTaskId;
        delete clone.volunteerTaskId;
        clone.volunteerTask = { connect: { id: volunteerTaskId } };
      }
      return clone;
    }

    case "attachment": {
      // Convert uploadedAt string to Date if present
      if (clone.uploadedAt) {
        clone.uploadedAt = new Date(clone.uploadedAt);
      }
      // Connect to volunteerTask if present
      if (clone.volunteerTaskId != null) {
        const volunteerTaskId = clone.volunteerTaskId;
        delete clone.volunteerTaskId;
        clone.volunteerTask = { connect: { id: volunteerTaskId } };
      }
      // Connect to uploadedBy if present
      if (clone.uploadedByMemberId != null) {
        const uploadedByMemberId = clone.uploadedByMemberId;
        delete clone.uploadedByMemberId;
        clone.uploadedBy = { connect: { id: uploadedByMemberId } };
      }
      return clone;
    }

    default:
      return clone;
  }
}

function mapFileBaseToModel(base: string): string {
  // Map JSON file names to Prisma model names
  const mapping: Record<string, string> = {
    orgs: "org",
    members: "member",
    events: "event",
    sponsors: "sponsor",
    rsvps: "rsvp",
    volunteerTasks: "volunteerTask",
    notes: "note",
    attachments: "attachment",
  };
  return mapping[base] || base;
}
