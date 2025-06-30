"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Minus, Plus, Send  } from "lucide-react";

type FloatingChatProps = {
  username: string;
  role: string;
};

type Student = {
  role: string;
  id: number;
  name: string;
};

export default function FloatingChat({ username, role }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // 👈 fetched students
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"groups" | "students">("students");
  const [groups, setGroups] = useState<any[]>([]); // You can type it later
  const [activeChat, setActiveChat] = useState<null | { type: "student" | "group"; id: number; name: string }>(null);

  const openChat = () => {
    setIsOpen(true);
    setIsCollapsed(false);
  };


  const collapseChat = () => {
    setIsOpen(false);
    setIsCollapsed(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsCollapsed(false);
    setShowGroupForm(false); // close group form if open
  };


  const closeGroupForm = () => setShowGroupForm(false);

  const createGroup = async () => {
    setLoading(true);
    try {
    const res = await fetch("/api/chat/group", {
      method: "POST",
      body: JSON.stringify({
        groupName,
        participantIds: selectedIds,
        createdBy: username,
        role:role,
      }),
    });

    if (res.ok) {
      // ✅ Reset and close form
      setGroupName("");
      setSelectedIds([]);
      setShowGroupForm(false);
    } else {
      alert("Failed to create group");
    }

    } catch (err) {
        console.error("Failed to create group:", err);
    } finally {
        setLoading(false);
    }
  };

    // 🧠 Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/chat/students");
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
      }
    };

    const fetchGroups = async () => {
    try {
        const res = await fetch("/api/chat/groups");
        const data = await res.json();
        setGroups(data);
    } catch (err) {
        console.error("Failed to fetch groups:", err);
    }
    };
    fetchStudents();
    fetchGroups()
  }, [role]);


  return (
    <>
      {/* Floating Button */}
      {(!isOpen || isCollapsed) && (
        <button
          onClick={openChat}
          className="fixed bottom-10 right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg hover:bg-indigo-600 transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="fixed bottom-10 right-10 z-50 w-80 max-w-sm rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-500 text-white">
            <span className="font-semibold">Chat ({username.charAt(0).toUpperCase() + username.slice(1)})</span>
            <div className="flex gap-2">
              <button onClick={collapseChat}>
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={closeChat}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        <div className="p-4 text-sm text-gray-700 h-[25rem] overflow-y-auto space-y-3">
            {!activeChat ? (
                <>
                    <div className="text-sm text-gray-700 h-[25rem] overflow-y-auto space-y-3">
                        <p>Welcome, {username.toUpperCase()}!</p>

                        {/* Admin-only: Create Group Button */}
                        {role === "admin" && (
                            <div className="mt-2">
                            <button
                                onClick={() => setShowGroupForm(true)}
                                disabled={showGroupForm}
                                className={`w-full py-1 rounded flex justify-center items-center transition-colors ${
                                showGroupForm
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                }`}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Create Group
                            </button>
                            </div>
                        )}
                        {/* Tabs */}
                        <div className="flex border-b">
                            <button
                            className={`flex-1 px-4 py-2 text-sm font-medium ${
                                activeTab === "students"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-white text-gray-600"
                            }`}
                            onClick={() => setActiveTab("students")}
                            >
                            Students
                            </button>
                            <button
                            className={`flex-1 px-4 py-2 text-sm font-medium ${
                                activeTab === "groups"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-white text-gray-600"
                            }`}
                            onClick={() => setActiveTab("groups")}
                            >
                            Groups
                            </button>
                        </div>

                        {/* Content */}
                        <div className="pt-2 max-h-[18rem] overflow-y-auto space-y-2">
                            {activeTab === "students" && (
                            <div className="space-y-2">
                                {students.length === 0 ? (
                                <p className="text-xs text-gray-500">No students found.</p>
                                ) : (
                                students.filter((s) => role !== "admin" || s.role === "student").map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => setActiveChat({ type: "student", id: student.id, name: student.name })}
                                        className="flex justify-between items-center px-3 py-2 bg-gray-100 rounded shadow-sm"
                                    >
                                        <span className="text-sm">{student.name.charAt(0).toUpperCase() + student.name.slice(1)}</span>
                                        {student.role === "admin" && (
                                        <span className="text-xs px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded-full">
                                            Admin
                                        </span>
                                        )}
                                    </div>
                                    ))
                                )}
                            </div>
                            )}

                            {activeTab === "groups" && (
                            <div className="space-y-2">
                                {groups.length === 0 ? (
                                <p className="text-xs text-gray-500">No groups created yet.</p>
                                ) : (
                                groups.map((group) => (
                                    <div
                                    key={group.id}
                                    onClick={() => setActiveChat({ type: "group", id: group.id, name: group.name })}
                                    className="px-3 py-2 bg-indigo-100 text-indigo-800 rounded shadow-sm text-sm"
                                    >
                                    {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
                                    </div>
                                ))
                                )}
                            </div>
                            )}
                        </div>
                        </div>
                </>
            ) : (
                <>
                {activeChat && (
                    <div className="mt-3 pt-2 flex flex-col h-[22rem] max-h-[80vh]">
  {/* Header */}
  <div className="flex justify-between items-center mb-2">
    <h4 className="text-sm font-semibold text-gray-800">
      Chat with {activeChat.name.charAt(0).toUpperCase() + activeChat.name.slice(1)}
    </h4>
    <button
      onClick={() => setActiveChat(null)}
      className="text-gray-500 hover:text-red-500"
    >
      <X className="h-4 w-4" />
    </button>
  </div>

  {/* Message Area */}
  <div className="flex-1 bg-gray-50 border rounded p-2 text-sm text-gray-600 overflow-y-auto">
    <p className="text-xs italic text-gray-400">No messages yet</p>
  </div>

  {/* Input + Send Button */}
  <div className="mt-2 flex gap-2">
    <input
      type="text"
      placeholder="Type a message..."
      className="flex-1 border px-2 py-1 rounded text-sm"
    />
    <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded">
      <Send className="h-4 w-4" />
    </button>
  </div>
</div>

                )}
                </>
            )}
            </div>
        </div>
      )}  

      {/* Group Form Popup */}
      {showGroupForm && (
        <div className="fixed bottom-28 right-10 z-50 w-[22rem] rounded-xl bg-white shadow-xl border border-gray-300 p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-gray-800">Create Group Chat</h3>
            <button
              onClick={closeGroupForm}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="w-full px-2 py-1 mb-3 border rounded text-sm"
          />

          {/* Student Checkboxes */}
            <div className="mb-2">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Select Students</span>
                <div className="space-x-2">
                <button
                    type="button"
                    onClick={() => setSelectedIds(students.map((s) => s.id))}
                    className="text-xs text-indigo-600 hover:underline"
                >
                    Select All
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-gray-500 hover:underline"
                >
                    Clear All
                </button>
                </div>
            </div>

            <div className="max-h-40 overflow-y-auto border rounded p-2">
                {students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 text-sm mb-1">
                    <input
                    type="checkbox"
                    checked={selectedIds.includes(student.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                        setSelectedIds([...selectedIds, student.id]);
                        } else {
                        setSelectedIds(selectedIds.filter((id) => id !== student.id));
                        }
                    }}
                    />
                    {student.name}
                </label>
                ))}
            </div>
            </div>

          <button
            onClick={createGroup}
            disabled={loading || groupName.trim() === "" || selectedIds.length < 1}
            className={`w-full py-1 rounded transition-colors flex justify-center items-center ${
                groupName.trim() === "" || selectedIds.length < 1 || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
            >
            {loading ? (
                <svg
                className="animate-spin h-4 w-4 mr-1 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                ></path>
                </svg>
            ) : null}
            {loading ? "Creating..." : "Create Group"}
            </button>

        </div>
      )}
    </>
  );
}
