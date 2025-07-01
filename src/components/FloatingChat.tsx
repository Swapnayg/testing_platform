"use client";

import { useEffect, useState, Key } from "react";
import { MessageCircle, X, Minus, Plus, Send  } from "lucide-react";
import { pusherClient } from "@/lib/pusher-client";

type FloatingChatProps = {
  username: string;
  role: string;
  userId:number;
};

type Student = {
  id: number;
  name: string;
  role: string;
  unreadByChat?: { chatId: number; count: number }[];
};


export default function FloatingChat({ username, role, userId }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [students, setStudents] = useState<Student[]>([]); // 👈 fetched students
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"groups" | "students">("students");
  const [groups, setGroups] = useState<any[]>([]); // You can type it later
  const [activeChat, setActiveChat] = useState<null | { type: "student" | "group"; id: number; name: string; chatId: number | string }>(null);
  const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = students.filter((s) => s.id !== userId).filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const totalUnread = filteredStudents.reduce((total, student) => {
      const unreadCount = student.unreadByChat?.reduce((sum, chat) => sum + chat.count, 0) || 0;
      return total + unreadCount;
    }, 0);


  type Message = {
    id: number;
    content: string;
    createdAt: string | Date;
    senderId: number;
    receiverId: number | null;
    chatId: number;
    groupId: number | null;
    chatType: "STUDENT" | "GROUP";
    sender: {
      id: number;
      name: string;
    };
    receiver: {
      id: number;
      name: string;
    } | null;
  };

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]); // store messages locally

    // Send message

    const sendMessage = async () => {
      if (!message.trim() || !activeChat) return;

      const payload = {
        content: message.trim(),
        chatId: activeChat.chatId,
        senderId: userId,
        receiverId: activeChat.type === "student" ? activeChat.id : null,
        groupId: activeChat.type === "group" ? activeChat.id : null,
        chatType: activeChat.type.toUpperCase(), // "STUDENT" | "GROUP"
      };

      setMessage("");

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(), // temporary unique id as number
          content: message.trim(),
          senderId: userId,
          receiverId: activeChat.type === "student" ? activeChat.id : null,
          chatId: Number(activeChat.chatId),
          groupId: activeChat.type === "group" ? activeChat.id : null,
          chatType: activeChat.type.toUpperCase() as "STUDENT" | "GROUP",
          createdAt: new Date().toISOString(),
          sender: {
            id: userId,
            name: username,
          },
          receiver: activeChat.type === "student"
            ? { id: activeChat.id, name: activeChat.name }
            : null,
        }
      ]);

      try {
        await fetch("/api/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Failed to deliver message:", err);
      }
    };

    const openChat = () => {
        setIsOpen(true);
        setIsCollapsed(false);
    };
useEffect(() => {
  if (!activeChat) return;

  const channel = pusherClient.subscribe(`chat-${activeChat.chatId}`);

  channel.bind("new-message", (data: Message) => {
    // Prevent duplicate message from showing (already added via optimistic update)
    if (data.senderId === userId) return;

    setMessages((prev) => [
      ...prev,
      {
        id: typeof data.id === "number" ? data.id : Date.now(),
        content: data.content,
        senderId: data.senderId as number,
        receiverId: data.receiverId ?? null,
        chatId: Number(data.chatId),
        groupId: data.groupId ?? null,
        chatType: data.chatType ?? "STUDENT",
        createdAt: data.createdAt,
        sender: data.sender ?? { id: 0, name: "Unknown" },
        receiver: typeof data.receiver !== "undefined" ? data.receiver : null,
      },
    ]);
  });

  return () => {
    pusherClient.unsubscribe(`chat-${activeChat.chatId}`);
  };
}, [activeChat?.chatId, userId]);

    useEffect(() => {
      const fetchMessages = async () => {
        if (!activeChat) return;
        const res = await fetch(`/api/chat/messages?chatId=${activeChat.chatId}&currentUserId=${userId}`);
        const data = await res.json();
        setMessages(data);
      };

      fetchMessages();
    }, [activeChat]);



  const collapseChat = () => {
    setIsOpen(false);
    setIsCollapsed(true);
  };

  // Create this util function to handle chat initialization
    async function initiateChat({ type, id, senderId }: { type: string; id: number; senderId: number }) {
        try {
            const res = await fetch(
            `/api/chat/get-or-create-chat?type=${type}&id=${id}&senderId=${senderId}`
            );
            const data = await res.json();

            if (!res.ok) {
            throw new Error(data.error || "Failed to initiate chat");
            }
            return data.chatId;
        } catch (err) {
            console.error("Chat initiation failed:", err);
            return null;
        }
    }


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
      fetchGroups();
    } else {
      alert("Failed to create group");
    }

    } catch (err) {
        console.error("Failed to create group:", err);
    } finally {
        setLoading(false);
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

    // 🧠 Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/chat/students?userId=${userId}`);
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
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
          
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
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
                              {/* Search Input */}
                              <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-2 text-sm border rounded mb-2"
                              />

                              {/* No Results Message */}
                             {filteredStudents.length === 0 ? (
                                <p className="text-xs text-gray-500">No students found.</p>
                              ) : (
                                filteredStudents.map((student) => (
                                  <div
                                    key={student.id}
                                    onClick={async () => {
                                      const chatId = await initiateChat({
                                        type: "student",
                                        id: student.id,
                                        senderId: userId,
                                      });
                                      if (chatId) {
                                        setActiveChat({
                                          type: "student",
                                          id: student.id,
                                          name: student.name,
                                          chatId,
                                        });
                                      }
                                    }}
                                    className="flex justify-between items-center px-3 py-2 bg-gray-100 rounded shadow-sm cursor-pointer hover:bg-gray-200"
                                  >
                                    <span className="text-sm">
                                      {student.name.charAt(0).toUpperCase() + student.name.slice(1)}
                                    </span>

                                    {student.unreadByChat && student.unreadByChat.length > 0 && (
                                      <div className="flex flex-col ml-4 gap-1">
                                        {student.unreadByChat.map((chat) => (
                                          <span
                                            key={chat.chatId}
                                            className="text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-0.5 rounded-full shadow-md inline-block w-fit"
                                          >
                                            {chat.count > 9 ? "9+" : chat.count}
                                          </span>
                                        ))}
                                      </div>
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
                                    onClick={async () => { const chatId = await initiateChat({ type: "group", id: group.id, senderId: userId }); if (chatId) { setActiveChat({ type: "group", id: group.id, name: group.name, chatId });}}}
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
                      <div className="flex-1 bg-gray-50 border rounded p-2 text-sm text-gray-600 overflow-y-auto space-y-2">
                        {messages.length === 0 ? (
                          <p className="text-xs italic text-gray-400">No messages yet</p>
                        ) : (
                          messages.map((msg) => {
                            const isOwnMessage = msg.senderId === userId;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`px-3 py-1 rounded-lg max-w-xs ${
                                    isOwnMessage
                                      ? "bg-indigo-500 text-white"
                                      : "bg-gray-200 text-gray-800"
                                  }`}
                                >
                                  {/* Sender Name */}
                                  {!isOwnMessage && (
                                    <div className="text-xs font-semibold text-indigo-600 mb-0.5">
                                      {msg.sender?.name || "Unknown"}
                                    </div>
                                  )}

                                  {/* Message Content */}
                                  <div className="text-sm">{msg.content}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                        {/* Input + Send Button */}
                        <div className="mt-2 flex gap-2">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                type="text"
                                placeholder="Type a message..."
                                className="flex-1 border px-2 py-1 rounded text-sm"
                                />
                            <button onClick={sendMessage} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded">
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
                   {student.name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
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
