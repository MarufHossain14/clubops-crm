import Modal from "@/components/Modal";
import { Priority, Status, useCreateTaskMutation } from "@/state/api";
import React, { useState } from "react";
import { formatISO } from "date-fns";
import { useToast } from "@/components/Toast/ToastContainer";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState("");

  const handleSubmit = async () => {
    if (!title || !authorUserId || !(id !== null || projectId)) return;

    try {
      const formattedStartDate = startDate
        ? formatISO(new Date(startDate), {
            representation: "complete",
          })
        : undefined;
      const formattedDueDate = dueDate
        ? formatISO(new Date(dueDate), {
            representation: "complete",
          })
        : undefined;

      await createTask({
        title,
        description,
        status,
        priority,
        tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        authorUserId: parseInt(authorUserId),
        assignedUserId: assignedUserId ? parseInt(assignedUserId) : undefined,
        projectId: id !== null ? Number(id) : Number(projectId),
      }).unwrap();

      // Close modal and reset form after successful creation
      onClose();
      setTitle("");
      setDescription("");
      setStatus(Status.ToDo);
      setPriority(Priority.Backlog);
      setTags("");
      setStartDate("");
      setDueDate("");
      setAuthorUserId("");
      setAssignedUserId("");
      setProjectId("");
      showToast("Task created successfully", "success");
    } catch (error: any) {
      const errorMessage = error?.data?.error?.message || error?.message || "Failed to create task";
      showToast(errorMessage, "error");
    }
  };

  const isFormValid = () => {
    return title && authorUserId && (id !== null || projectId);
  };

  const selectStyles =
    "mb-4 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900";

  const inputStyles =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900";

  const textareaStyles =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 resize-y min-h-[100px] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900";

  return (
    <>
      <style>{`
        select option {
          background-color: white;
          color: #111827;
        }
        .dark select option {
          background-color: #374151;
          color: white;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.6;
        }
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.8;
        }
      `}</style>
      <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
        <form
          className="mt-4 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
        <input
          type="text"
          className={inputStyles}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={textareaStyles}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            value={status}
            onChange={(e) =>
              setStatus(Status[e.target.value as keyof typeof Status])
            }
          >
            <option value="">Select Status</option>
            <option value={Status.ToDo}>To Do</option>
            <option value={Status.WorkInProgress}>Work In Progress</option>
            <option value={Status.UnderReview}>Under Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) =>
              setPriority(Priority[e.target.value as keyof typeof Priority])
            }
          >
            <option value="">Select Priority</option>
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className={inputStyles}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <input
          type="text"
          className={inputStyles}
          placeholder="Author User ID"
          value={authorUserId}
          onChange={(e) => setAuthorUserId(e.target.value)}
        />
        <input
          type="text"
          className={inputStyles}
          placeholder="Assigned User ID"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        />
        {id === null && (
          <input
            type="text"
            className={inputStyles}
            placeholder="ProjectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          />
        )}
        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`flex-1 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 ${
              !isFormValid() || isLoading
                ? "cursor-not-allowed bg-gray-400 opacity-60 dark:bg-gray-600"
                : "bg-blue-600 shadow-sm hover:bg-blue-700 hover:shadow-md active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            }`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </form>
    </Modal>
    </>
  );
};

export default ModalNewTask;
