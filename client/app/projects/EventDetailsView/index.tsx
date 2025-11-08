"use client";

import { useGetRSVPsQuery } from "@/state/api";
import React from "react";
import { Calendar, CheckCircle2, User, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

type Props = {
  eventId: number;
};

const EventDetailsView = ({ eventId }: Props) => {
  const { data: rsvps, isLoading, error } = useGetRSVPsQuery({ eventId });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-4">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading RSVPs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <h3 className="mb-2 font-semibold text-red-800 dark:text-red-400">
            Error Loading RSVPs
          </h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            Could not load RSVPs for this event.
          </p>
        </div>
      </div>
    );
  }

  if (!rsvps || rsvps.length === 0) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No RSVPs Yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No one has RSVP'd for this event yet.
          </p>
        </div>
      </div>
    );
  }

  // Group RSVPs by status
  const rsvpsByStatus = rsvps.reduce(
    (acc: Record<string, typeof rsvps>, rsvp) => {
      const status = rsvp.status || "Unknown";
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(rsvp);
      return acc;
    },
    {}
  );

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    CONFIRMED: {
      label: "Confirmed",
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-green-600 dark:text-green-400",
    },
    DECLINED: {
      label: "Declined",
      icon: <XCircle className="h-5 w-5" />,
      color: "text-red-600 dark:text-red-400",
    },
    PENDING: {
      label: "Pending",
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-600 dark:text-yellow-400",
    },
  };

  const totalRSVPs = rsvps.length;
  const confirmedCount = rsvpsByStatus["CONFIRMED"]?.length || 0;
  const declinedCount = rsvpsByStatus["DECLINED"]?.length || 0;
  const pendingCount = rsvpsByStatus["PENDING"]?.length || 0;
  const checkedInCount = rsvps.filter((r) => r.checkedIn).length;

  return (
    <div className="p-4 xl:px-6">
      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total RSVPs"
          value={totalRSVPs}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Confirmed"
          value={confirmedCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon={<Clock className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          label="Checked In"
          value={checkedInCount}
          icon={<User className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* RSVPs by Status */}
      <div className="space-y-6">
        {Object.entries(rsvpsByStatus).map(([status, statusRsvps]) => {
          const config = statusConfig[status] || {
            label: status,
            icon: <Calendar className="h-5 w-5" />,
            color: "text-gray-600 dark:text-gray-400",
          };

          return (
            <div
              key={status}
              className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                  <span className={config.color}>{config.icon}</span>
                  {config.label} ({statusRsvps.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {statusRsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {rsvp.member?.fullName || "Unknown Member"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {rsvp.member?.email || "No email"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {rsvp.checkedIn && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Checked In
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {rsvp.member?.role || "Member"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "purple";
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default EventDetailsView;

