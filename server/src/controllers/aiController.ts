import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Feature 1: Event Risk Detection & Alerts
export const analyzeEventRisks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        rsvps: {
          include: {
            member: true,
          },
        },
        volunteerTasks: {
          include: {
            assignee: true,
          },
        },
        org: {
          include: {
            sponsors: true,
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const risks: Array<{
      type: string;
      severity: "low" | "medium" | "high";
      message: string;
      suggestion: string;
      data?: any;
    }> = [];

    // Risk 1: Low RSVP rate
    if (event.capacity) {
      const confirmedRSVPs = event.rsvps.filter(
        (r) => r.status === "CONFIRMED"
      ).length;
      const rsvpRate = (confirmedRSVPs / event.capacity) * 100;

      if (rsvpRate < 30) {
        risks.push({
          type: "low_rsvp",
          severity: "high",
          message: `Only ${rsvpRate.toFixed(0)}% capacity filled (${confirmedRSVPs}/${event.capacity} confirmed)`,
          suggestion: "Send reminder emails to increase attendance",
          data: { rsvpRate, confirmedRSVPs, capacity: event.capacity },
        });
      } else if (rsvpRate < 50) {
        risks.push({
          type: "low_rsvp",
          severity: "medium",
          message: `RSVP rate at ${rsvpRate.toFixed(0)}% (${confirmedRSVPs}/${event.capacity})`,
          suggestion: "Consider sending follow-up emails",
          data: { rsvpRate, confirmedRSVPs, capacity: event.capacity },
        });
      }
    }

    // Risk 2: Overdue critical tasks
    const now = new Date();
    const overdueTasks = event.volunteerTasks.filter((task) => {
      if (!task.dueAt || task.status === "Completed") return false;
      const dueDate = new Date(task.dueAt);
      return (
        dueDate < now &&
        (task.priority === "Urgent" || task.priority === "High")
      );
    });

    if (overdueTasks.length > 0) {
      risks.push({
        type: "overdue_tasks",
        severity: "high",
        message: `${overdueTasks.length} critical task${overdueTasks.length > 1 ? "s" : ""} overdue`,
        suggestion: "Reassign tasks or extend deadlines immediately",
        data: { tasks: overdueTasks.map((t) => ({ id: t.id, title: t.title, dueAt: t.dueAt })) },
      });
    }

    // Risk 3: Tasks due soon (within 24 hours)
    const tasksDueSoon = event.volunteerTasks.filter((task) => {
      if (!task.dueAt || task.status === "Completed") return false;
      const dueDate = new Date(task.dueAt);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilDue > 0 && hoursUntilDue <= 24 && task.priority !== "Completed";
    });

    if (tasksDueSoon.length > 0) {
      risks.push({
        type: "tasks_due_soon",
        severity: "medium",
        message: `${tasksDueSoon.length} task${tasksDueSoon.length > 1 ? "s" : ""} due within 24 hours`,
        suggestion: "Send reminders to task assignees",
        data: { tasks: tasksDueSoon.map((t) => ({ id: t.id, title: t.title, dueAt: t.dueAt })) },
      });
    }

    // Risk 4: Low task completion rate
    const totalTasks = event.volunteerTasks.length;
    const completedTasks = event.volunteerTasks.filter(
      (t) => t.status === "Completed"
    ).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

    if (totalTasks > 0 && completionRate < 50) {
      risks.push({
        type: "low_completion",
        severity: "medium",
        message: `Only ${completionRate.toFixed(0)}% of tasks completed (${completedTasks}/${totalTasks})`,
        suggestion: "Review task assignments and provide support",
        data: { completionRate, completedTasks, totalTasks },
      });
    }

    // Risk 5: Event starting soon with incomplete tasks
    const eventStartDate = new Date(event.startsAt);
    const daysUntilEvent = (eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const incompleteTasks = event.volunteerTasks.filter(
      (t) => t.status !== "Completed"
    ).length;

    if (daysUntilEvent > 0 && daysUntilEvent <= 7 && incompleteTasks > 0) {
      risks.push({
        type: "event_approaching",
        severity: daysUntilEvent <= 3 ? "high" : "medium",
        message: `Event in ${Math.ceil(daysUntilEvent)} day${Math.ceil(daysUntilEvent) > 1 ? "s" : ""} with ${incompleteTasks} incomplete task${incompleteTasks > 1 ? "s" : ""}`,
        suggestion: "Prioritize remaining tasks and check resource availability",
        data: { daysUntilEvent: Math.ceil(daysUntilEvent), incompleteTasks },
      });
    }

    // Risk 6: Unassigned critical tasks
    const unassignedCriticalTasks = event.volunteerTasks.filter(
      (t) => !t.assigneeMemberId && (t.priority === "Urgent" || t.priority === "High")
    );

    if (unassignedCriticalTasks.length > 0) {
      risks.push({
        type: "unassigned_tasks",
        severity: "high",
        message: `${unassignedCriticalTasks.length} critical task${unassignedCriticalTasks.length > 1 ? "s" : ""} not assigned`,
        suggestion: "Assign tasks to available volunteers immediately",
        data: { tasks: unassignedCriticalTasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority })) },
      });
    }

    // Calculate overall risk score
    const riskScore = risks.reduce((score, risk) => {
      if (risk.severity === "high") return score + 3;
      if (risk.severity === "medium") return score + 2;
      return score + 1;
    }, 0);

    const overallRiskLevel =
      riskScore >= 6 ? "high" : riskScore >= 3 ? "medium" : "low";

    res.json({
      eventId: event.id,
      eventTitle: event.title,
      riskLevel: overallRiskLevel,
      riskScore,
      risks,
      summary: {
        totalRisks: risks.length,
        highRisks: risks.filter((r) => r.severity === "high").length,
        mediumRisks: risks.filter((r) => r.severity === "medium").length,
        lowRisks: risks.filter((r) => r.severity === "low").length,
      },
    });
  } catch (error: any) {
    console.error("Error analyzing event risks:", error);
    res.status(500).json({
      message: `Error analyzing event risks: ${error.message}`,
    });
  }
};

// Feature 2: Automated Email Generation
export const generateEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, eventId, taskId, memberId, recipientEmail, recipientName } = req.body;

    // For hackathon demo, we'll use a simple template-based approach
    // In production, you'd use OpenAI API for more sophisticated generation

    let emailContent = {
      subject: "",
      body: "",
      to: recipientEmail || "",
    };

    // Get event details if eventId provided
    let event = null;
    if (eventId) {
      event = await prisma.event.findUnique({
        where: { id: parseInt(eventId) },
        include: {
          org: true,
        },
      });
    }

    // Get task details if taskId provided
    let task = null;
    if (taskId) {
      task = await prisma.volunteerTask.findUnique({
        where: { id: parseInt(taskId) },
        include: {
          event: true,
          assignee: true,
        },
      });
    }

    // Generate email based on type
    switch (type) {
      case "event_reminder":
        if (!event) {
          res.status(400).json({ message: "Event ID required for event reminder" });
          return;
        }
        emailContent.subject = `Reminder: ${event.title} - ${new Date(event.startsAt).toLocaleDateString()}`;
        emailContent.body = `
Dear ${recipientName || "Volunteer"},

This is a friendly reminder about the upcoming event:

Event: ${event.title}
Date: ${new Date(event.startsAt).toLocaleString()} - ${new Date(event.endsAt).toLocaleString()}
${event.location ? `Location: ${event.location}` : ""}

We're looking forward to seeing you there!

Best regards,
${event.org?.name || "Event Management Team"}
        `.trim();
        break;

      case "task_assignment":
        if (!task) {
          res.status(400).json({ message: "Task ID required for task assignment" });
          return;
        }
        emailContent.subject = `New Task Assignment: ${task.title}`;
        emailContent.body = `
Dear ${recipientName || task.assignee?.fullName || "Volunteer"},

You have been assigned a new task for the event "${task.event.title}":

Task: ${task.title}
Priority: ${task.priority || "Medium"}
${task.dueAt ? `Due Date: ${new Date(task.dueAt).toLocaleString()}` : ""}
${task.event.location ? `Event Location: ${task.event.location}` : ""}

Please log in to your dashboard to view task details and update your progress.

Thank you for your commitment!

Best regards,
Event Management Team
        `.trim();
        break;

      case "task_reminder":
        if (!task) {
          res.status(400).json({ message: "Task ID required for task reminder" });
          return;
        }
        const dueDate = task.dueAt ? new Date(task.dueAt) : null;
        const daysUntilDue = dueDate
          ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;

        emailContent.subject = `Reminder: Task "${task.title}" ${dueDate && daysUntilDue ? `due in ${daysUntilDue} day${daysUntilDue > 1 ? "s" : ""}` : "pending"}`;
        emailContent.body = `
Dear ${recipientName || task.assignee?.fullName || "Volunteer"},

This is a reminder about your assigned task:

Task: ${task.title}
Priority: ${task.priority || "Medium"}
${dueDate ? `Due Date: ${dueDate.toLocaleString()}` : "No due date set"}
Status: ${task.status}
Event: ${task.event.title}

${dueDate && daysUntilDue && daysUntilDue <= 1
            ? "⚠️ This task is due soon! Please prioritize completing it."
            : "Please ensure this task is completed on time."}

Thank you!

Best regards,
Event Management Team
        `.trim();
        break;

      case "sponsor_thank_you":
        if (!event) {
          res.status(400).json({ message: "Event ID required for sponsor thank you" });
          return;
        }
        emailContent.subject = `Thank You for Supporting ${event.title}`;
        emailContent.body = `
Dear ${recipientName || "Sponsor"},

On behalf of ${event.org?.name || "our organization"}, we would like to extend our heartfelt gratitude for your support of "${event.title}".

Your sponsorship makes a significant impact on our ability to deliver this event successfully.

Event Details:
- Event: ${event.title}
- Date: ${new Date(event.startsAt).toLocaleDateString()}

We look forward to continuing our partnership with you.

With sincere appreciation,
${event.org?.name || "Event Management Team"}
        `.trim();
        break;

      case "rsvp_confirmation":
        if (!event) {
          res.status(400).json({ message: "Event ID required for RSVP confirmation" });
          return;
        }
        emailContent.subject = `RSVP Confirmation: ${event.title}`;
        emailContent.body = `
Dear ${recipientName || "Guest"},

Thank you for confirming your attendance at "${event.title}".

Event Details:
- Event: ${event.title}
- Date: ${new Date(event.startsAt).toLocaleString()} - ${new Date(event.endsAt).toLocaleString()}
${event.location ? `- Location: ${event.location}` : ""}

We're excited to have you join us! If you have any questions, please don't hesitate to reach out.

See you there!

Best regards,
${event.org?.name || "Event Management Team"}
        `.trim();
        break;

      default:
        res.status(400).json({
          message: "Invalid email type. Supported types: event_reminder, task_assignment, task_reminder, sponsor_thank_you, rsvp_confirmation",
        });
        return;
    }

    res.json({
      success: true,
      email: emailContent,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating email:", error);
    res.status(500).json({
      message: `Error generating email: ${error.message}`,
    });
  }
};

// Get all events with risk analysis
export const getAllEventsWithRisks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      include: {
        rsvps: true,
        volunteerTasks: true,
        org: {
          include: {
            sponsors: true,
          },
        },
      },
    });

    const eventsWithRisks = await Promise.all(
      events.map(async (event) => {
        // Quick risk calculation (simplified version)
        const confirmedRSVPs = event.rsvps.filter((r) => r.status === "CONFIRMED").length;
        const rsvpRate = event.capacity ? (confirmedRSVPs / event.capacity) * 100 : 0;
        const overdueTasks = event.volunteerTasks.filter((task) => {
          if (!task.dueAt || task.status === "Completed") return false;
          return new Date(task.dueAt) < new Date() && (task.priority === "Urgent" || task.priority === "High");
        }).length;

        let riskLevel: "low" | "medium" | "high" = "low";
        if (rsvpRate < 30 || overdueTasks > 0) riskLevel = "high";
        else if (rsvpRate < 50 || overdueTasks > 2) riskLevel = "medium";

        return {
          eventId: event.id,
          eventTitle: event.title,
          riskLevel,
          riskCount: overdueTasks + (rsvpRate < 30 ? 1 : 0),
        };
      })
    );

    res.json(eventsWithRisks);
  } catch (error: any) {
    console.error("Error getting events with risks:", error);
    res.status(500).json({
      message: `Error getting events with risks: ${error.message}`,
    });
  }
};
