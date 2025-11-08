"use client";

import { useGetEventRisksQuery, useGenerateEmailMutation } from "@/state/api";
import { useToast } from "@/components/Toast/ToastContainer";
import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  AlertCircle,
  Info,
  Copy,
  Check,
  Loader2,
  X,
} from "lucide-react";

type Props = {
  eventId: number;
};

const EventRiskAnalysis = ({ eventId }: Props) => {
  const { data: riskAnalysis, isLoading, error } = useGetEventRisksQuery(eventId);
  const [generateEmail, { isLoading: isGeneratingEmail }] = useGenerateEmailMutation();
  const { showToast } = useToast();
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
    to?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const getRiskIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRiskSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getRiskLevelBadge = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      default:
        return "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
    }
  };

  const handleGenerateEmail = async (type: string) => {
    try {
      const result = await generateEmail({
        type: type as any,
        eventId,
        // For task_reminder, we pass eventId to get all tasks needing reminders
        // For event_reminder, eventId is already passed
      }).unwrap();
      setGeneratedEmail({
        subject: result.email.subject,
        body: result.email.body,
        to: result.email.to || "",
      });
      showToast("Email generated successfully", "success");
    } catch (error: any) {
      console.error("Error generating email:", error);
      const errorMessage = error?.data?.error?.message || error?.message || "Failed to generate email";
      showToast(errorMessage, "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Email copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (!generatedEmail) return;

    // Validate email if provided
    if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // In a real implementation, this would call an API to send the email
    // For now, we'll show a success message
    showToast(
      recipientEmail
        ? `Email would be sent to ${recipientEmail} (Email service integration required)`
        : "Email sending requires email service integration (e.g., SendGrid, AWS SES)",
      "info"
    );

    // Close modal after a brief delay
    setTimeout(() => {
      setShowSendModal(false);
      setRecipientEmail("");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyzing risks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Error loading risk analysis
        </p>
      </div>
    );
  }

  if (!riskAnalysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Risk Summary - Minimal Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              Risk Analysis
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Event health overview
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${getRiskLevelBadge(
              riskAnalysis.riskLevel
            )}`}
          >
            {riskAnalysis.riskLevel.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col">
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {riskAnalysis.summary.totalRisks}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Total
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {riskAnalysis.summary.highRisks}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              High
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
              {riskAnalysis.summary.mediumRisks}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Medium
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {riskAnalysis.summary.lowRisks}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Low
            </div>
          </div>
        </div>
      </div>

      {/* Risks List - Minimal Style */}
      {riskAnalysis.risks.length > 0 ? (
        <div className="space-y-3">
          {riskAnalysis.risks.map((risk, index) => (
            <div
              key={index}
              className="group rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-black dark:hover:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {getRiskIcon(risk.severity)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {risk.message}
                    </h4>
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getRiskSeverityColor(
                        risk.severity
                      )} bg-opacity-10`}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {risk.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-black">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
            No risks detected
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            Your event is on track
          </p>
        </div>
      )}

      {/* Quick Actions - Minimal Style */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-black">
        <h4 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
          Quick actions
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGenerateEmail("event_reminder")}
            disabled={isGeneratingEmail}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            {isGeneratingEmail ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="h-3.5 w-3.5" />
                Event reminder
              </>
            )}
          </button>
          <button
            onClick={() => handleGenerateEmail("task_reminder")}
            disabled={isGeneratingEmail}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100"
          >
            {isGeneratingEmail ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="h-3.5 w-3.5" />
                Task reminders
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Email Preview - Minimal Style */}
      {generatedEmail && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black">
          <div className="mb-5 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Generated email
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSendModal(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Mail className="h-3.5 w-3.5" />
                Send Email
              </button>
              <button
                onClick={() => copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-black dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-500">
                Subject
              </label>
              <div className="rounded-md border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
                {generatedEmail.subject}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-500">
                Body
              </label>
              <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-900 whitespace-pre-wrap dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
                {generatedEmail.body}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showSendModal && generatedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Email
              </h3>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setRecipientEmail("");
                }}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recipient Email <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty to send to all event participants
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Subject
                </div>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {generatedEmail.subject}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSendModal(false);
                    setRecipientEmail("");
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRiskAnalysis;
