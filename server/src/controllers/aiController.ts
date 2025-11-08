import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { ApiError } from "../middleware/errorHandler";

// Feature 1: Event Risk Detection & Alerts
export const analyzeEventRisks = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const { eventId } = req.params;

  // Validate eventId
  const eventIdNum = parseInt(eventId);
  if (isNaN(eventIdNum) || eventIdNum <= 0) {
    throw new ApiError(400, 'Invalid eventId');
  }

    const event = await prisma.event.findUnique({
      where: { id: eventIdNum },
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
      throw new ApiError(404, 'Event not found');
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
});

// Feature 2: Automated Email Generation
export const generateEmail = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
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
      const eventIdNum = typeof eventId === 'number' ? eventId : parseInt(String(eventId));
      if (isNaN(eventIdNum) || eventIdNum <= 0) {
        throw new ApiError(400, 'Invalid eventId');
      }
      event = await prisma.event.findUnique({
        where: { id: eventIdNum },
        include: {
          org: true,
        },
      });
      if (!event && (type === "event_reminder" || type === "task_reminder" || type === "sponsor_thank_you" || type === "rsvp_confirmation")) {
        throw new ApiError(404, 'Event not found');
      }
    }

    // Get task details if taskId provided
    let task = null;
    if (taskId) {
      const taskIdNum = typeof taskId === 'number' ? taskId : parseInt(String(taskId));
      if (isNaN(taskIdNum) || taskIdNum <= 0) {
        throw new ApiError(400, 'Invalid taskId');
      }
      task = await prisma.volunteerTask.findUnique({
        where: { id: taskIdNum },
        include: {
          event: true,
          assignee: true,
        },
      });
      if (!task && (type === "task_assignment" || type === "task_reminder")) {
        throw new ApiError(404, 'Task not found');
      }
    }

    // Generate email based on type
    switch (type) {
      case "event_reminder":
        if (!event) {
          throw new ApiError(400, "Event ID required for event reminder");
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
          throw new ApiError(400, "Task ID required for task assignment");
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
        // If taskId is provided, generate reminder for specific task
        if (taskId && task) {
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
        }
        // If eventId is provided but no taskId, generate reminder for all tasks needing attention
        else if (eventId && event) {
          const eventIdNum = typeof eventId === 'number' ? eventId : parseInt(String(eventId));
          // Get all tasks for this event that need reminders
          const allTasks = await prisma.volunteerTask.findMany({
            where: {
              eventId: eventIdNum,
              status: {
                not: "Completed"
              }
            },
            include: {
              assignee: true,
            },
            orderBy: [
              { dueAt: 'asc' },
              { priority: 'desc' }
            ]
          });

          if (allTasks.length === 0) {
            throw new ApiError(404, "No tasks found that need reminders for this event");
          }

          // Filter tasks that are overdue or due soon (within 7 days)
          const now = new Date();
          const tasksNeedingReminder = allTasks.filter(t => {
            if (!t.dueAt) return true; // Include tasks without due dates
            const dueDate = new Date(t.dueAt);
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilDue <= 7 || daysUntilDue < 0; // Due within 7 days or overdue
          });

          // If no tasks need reminders based on due dates, show all incomplete tasks (limit to 20)
          const finalTasks = tasksNeedingReminder.length > 0 ? tasksNeedingReminder : allTasks.slice(0, 20);

          // Generate summary email for event organizer
          const overdueCount = finalTasks.filter(t => {
            if (!t.dueAt) return false;
            return new Date(t.dueAt) < now;
          }).length;

          const dueSoonCount = finalTasks.filter(t => {
            if (!t.dueAt) return false;
            const dueDate = new Date(t.dueAt);
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilDue > 0 && daysUntilDue <= 7;
          }).length;

          const noDueDateCount = finalTasks.filter(t => !t.dueAt).length;

          emailContent.subject = `Task Reminders: ${event.title} - ${finalTasks.length} task${finalTasks.length > 1 ? "s" : ""} need attention`;
          emailContent.body = `
Dear ${recipientName || "Event Organizer"},

This is a summary of tasks for "${event.title}" that need attention:

📊 Summary:
- Total tasks needing attention: ${finalTasks.length}
- Overdue tasks: ${overdueCount}
- Tasks due within 7 days: ${dueSoonCount}
${noDueDateCount > 0 ? `- Tasks without due dates: ${noDueDateCount}` : ''}

📋 Tasks Needing Reminders:

${finalTasks.map((t, idx) => {
            const dueDate = t.dueAt ? new Date(t.dueAt) : null;
            const daysUntilDue = dueDate
              ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null;
            const statusIcon = dueDate && daysUntilDue !== null && daysUntilDue < 0 ? "🔴" :
                             dueDate && daysUntilDue !== null && daysUntilDue <= 1 ? "🟡" : "🟠";

            return `${idx + 1}. ${statusIcon} ${t.title}
   - Priority: ${t.priority || "Medium"}
   - Assignee: ${t.assignee?.fullName || "Unassigned"}
   - ${dueDate ? `Due: ${dueDate.toLocaleDateString()} ${daysUntilDue !== null && daysUntilDue < 0 ? "(OVERDUE)" : daysUntilDue !== null && daysUntilDue <= 7 ? `(${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""} remaining)` : ""}` : "No due date"}
   - Status: ${t.status}`;
          }).join("\n\n")}

${finalTasks.length > 0 ? "Please follow up with task assignees to ensure timely completion." : "All tasks are on track!"}

Best regards,
Event Management Team
          `.trim();
        } else {
          throw new ApiError(400, "Either taskId or eventId is required for task reminder");
        }
        break;

      case "sponsor_thank_you":
        if (!event) {
          throw new ApiError(400, "Event ID required for sponsor thank you");
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
          throw new ApiError(400, "Event ID required for RSVP confirmation");
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
        throw new ApiError(400, "Invalid email type. Supported types: event_reminder, task_assignment, task_reminder, sponsor_thank_you, rsvp_confirmation");
    }

    res.json({
      success: true,
      email: emailContent,
      generatedAt: new Date().toISOString(),
    });
});

// Get all events with risk analysis
export const getAllEventsWithRisks = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
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
});
