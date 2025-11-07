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

  // Global ID map to track old IDs -> new IDs for all models
  const globalIdMap: Record<string, Map<number, number>> = {};

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
      // Create ID map for this model
      const idMap = new Map<number, number>();
      globalIdMap[modelName] = idMap;

      // For orgs, we can set explicit IDs using raw SQL
      if (modelName === "org") {
        for (const raw of jsonData) {
          const data = transformForModel(modelName, raw, globalIdMap);
          // Use upsert to set explicit ID
          await model.upsert({
            where: { id: raw.id },
            update: {},
            create: { ...data, id: raw.id },
          });
          idMap.set(raw.id, raw.id); // Map old ID to same ID
        }
      } else {
        // For other models, create records and map old IDs to new auto-generated IDs
        for (const raw of jsonData) {
          const data = transformForModel(modelName, raw, globalIdMap);
          const created = await model.create({ data });
          idMap.set(raw.id, created.id);
        }
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
    const sequences = [
      { table: '"Org"', column: 'id' },
      { table: '"Member"', column: 'id' },
      { table: '"Event"', column: 'id' },
      { table: '"Sponsor"', column: 'id' },
      { table: '"RSVP"', column: 'id' },
      { table: '"VolunteerTask"', column: 'id' },
      { table: '"Note"', column: 'id' },
      { table: '"Attachment"', column: 'id' },
    ];

    for (const seq of sequences) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence(${seq.table}, '${seq.column}'), COALESCE((SELECT MAX(id) FROM ${seq.table}), 1), true);`
      );
    }
    console.log("✅ Reset database sequences");
  } catch (error) {
    console.warn("⚠️  Could not reset sequences (this is okay):", error);
  }

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());

function transformForModel(modelName: string, raw: any, globalIdMap?: Record<string, Map<number, number>>) {
  const clone = { ...raw };

  // Remove id field - let Prisma auto-generate (except for orgs which use upsert)
  delete (clone as any).id;

  // Use globalIdMap to map old IDs to new IDs for relationships

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
      // Connect to org (orgId should match the seeded org IDs)
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

    case "RSVP": {
      // Connect to event and member using global ID map
      const eventId = clone.eventId;
      const memberId = clone.memberId;
      delete clone.eventId;
      delete clone.memberId;

      if (globalIdMap) {
        const eventMap = globalIdMap["event"];
        const memberMap = globalIdMap["member"];
        const newEventId = eventMap?.get(eventId);
        const newMemberId = memberMap?.get(memberId);

        if (newEventId && newMemberId) {
          clone.event = { connect: { id: newEventId } };
          clone.member = { connect: { id: newMemberId } };
        } else {
          throw new Error(`Could not map IDs for RSVP: eventId=${eventId}->${newEventId}, memberId=${memberId}->${newMemberId}`);
        }
      } else {
        throw new Error("globalIdMap is required for RSVP relationships");
      }
      return clone;
    }

    case "volunteerTask": {
      // Convert dueAt string to Date if present
      if (clone.dueAt) {
        clone.dueAt = new Date(clone.dueAt);
      }
      // Connect to event using global ID map
      const eventId = clone.eventId;
      delete clone.eventId;

      if (globalIdMap) {
        const eventMap = globalIdMap["event"];
        const newEventId = eventMap?.get(eventId);
        if (newEventId) {
          clone.event = { connect: { id: newEventId } };
        } else {
          throw new Error(`Could not map eventId ${eventId} for VolunteerTask`);
        }
      } else {
        throw new Error("globalIdMap is required for VolunteerTask relationships");
      }

      // Connect to assignee if present
      if (clone.assigneeMemberId != null) {
        const assigneeMemberId = clone.assigneeMemberId;
        delete clone.assigneeMemberId;

        if (globalIdMap) {
          const memberMap = globalIdMap["member"];
          const newMemberId = memberMap?.get(assigneeMemberId);
          if (newMemberId) {
            clone.assignee = { connect: { id: newMemberId } };
          } else {
            // Assignee is optional, so just skip if not found
            console.warn(`Could not map assigneeMemberId ${assigneeMemberId} for VolunteerTask, skipping assignee`);
          }
        }
      }
      return clone;
    }

    case "note": {
      // Convert createdAt string to Date if present
      if (clone.createdAt) {
        clone.createdAt = new Date(clone.createdAt);
      }
      // Connect to author using global ID map
      const authorMemberId = clone.authorMemberId;
      delete clone.authorMemberId;

      if (globalIdMap) {
        const memberMap = globalIdMap["member"];
        const newMemberId = memberMap?.get(authorMemberId);
        if (newMemberId) {
          clone.author = { connect: { id: newMemberId } };
        } else {
          throw new Error(`Could not map authorMemberId ${authorMemberId} for Note`);
        }
      } else {
        throw new Error("globalIdMap is required for Note relationships");
      }

      // Connect to volunteerTask if present
      if (clone.volunteerTaskId != null) {
        const volunteerTaskId = clone.volunteerTaskId;
        delete clone.volunteerTaskId;

        if (globalIdMap) {
          const taskMap = globalIdMap["volunteerTask"];
          const newTaskId = taskMap?.get(volunteerTaskId);
          if (newTaskId) {
            clone.volunteerTask = { connect: { id: newTaskId } };
          } else {
            console.warn(`Could not map volunteerTaskId ${volunteerTaskId} for Note, skipping task relation`);
          }
        }
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

        if (globalIdMap) {
          const taskMap = globalIdMap["volunteerTask"];
          const newTaskId = taskMap?.get(volunteerTaskId);
          if (newTaskId) {
            clone.volunteerTask = { connect: { id: newTaskId } };
          } else {
            console.warn(`Could not map volunteerTaskId ${volunteerTaskId} for Attachment, skipping task relation`);
          }
        }
      }
      // Connect to uploadedBy if present
      if (clone.uploadedByMemberId != null) {
        const uploadedByMemberId = clone.uploadedByMemberId;
        delete clone.uploadedByMemberId;

        if (globalIdMap) {
          const memberMap = globalIdMap["member"];
          const newMemberId = memberMap?.get(uploadedByMemberId);
          if (newMemberId) {
            clone.uploadedBy = { connect: { id: newMemberId } };
          } else {
            console.warn(`Could not map uploadedByMemberId ${uploadedByMemberId} for Attachment, skipping uploader relation`);
          }
        }
      }
      return clone;
    }

    default:
      return clone;
  }
}

function mapFileBaseToModel(base: string): string {
  // Map JSON file names to Prisma model names (case-sensitive!)
  const mapping: Record<string, string> = {
    orgs: "org",
    members: "member",
    events: "event",
    sponsors: "sponsor",
    rsvps: "RSVP", // Model name is RSVP (uppercase) in schema
    volunteerTasks: "volunteerTask",
    notes: "note",
    attachments: "attachment",
  };
  return mapping[base] || base;
}
