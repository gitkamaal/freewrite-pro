"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>("Lato");
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullScreen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [rtlMode, setRtlMode] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderText, setPlaceholderText] = useState<string>("");

  const placeholderOptions = [
    "Begin writing",
    "Pick a thought and go",
    "Start typing",
    "What's on your mind",
    "Just start",
    "Type your first thought",
    "Start with one sentence",
    "Just say it",
  ];

  // Font options
  const fontOptions = [
    { name: "Lato", value: "Lato" },
    { name: "Arial", value: "Arial" },
    { name: "System", value: "system-ui" },
    { name: "Serif", value: "Times New Roman" },
  ];

  // Font size options
  const fontSizeOptions = [16, 18, 20, 22, 24, 26];

  interface Entry {
    id: string;
    date: string;
    content: string;
    previewText: string;
    filename: string;
  }

  // Create a new entry
  const createNewEntry = () => {
    const id = crypto.randomUUID();
    const now = new Date();
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    });
    const dateString = dateFormatter.format(now);

    const isoDate = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `[${id}]-[${isoDate}].md`;

    const newEntry: Entry = {
      id,
      date: dateString,
      content: "",
      previewText: "",
      filename,
    };

    // Add to beginning of entries list
    setEntries((prev) => [newEntry, ...prev]);
    setSelectedEntryId(id);
    setText("");

    // Set random placeholder
    setPlaceholderText(
      placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)]
    );
  };

  // Save current entry to localStorage
  const saveEntry = (entry: Entry) => {
    const updatedEntry = {
      ...entry,
      content: text,
      previewText:
        text.replace(/\n/g, " ").trim().slice(0, 30) +
        (text.length > 30 ? "..." : ""),
    };

    const updatedEntries = entries.map((e) =>
      e.id === updatedEntry.id ? updatedEntry : e
    );

    setEntries(updatedEntries);
    localStorage.setItem("freewrite-entries", JSON.stringify(updatedEntries));
  };

  // Load entries from localStorage
  const loadEntries = () => {
    const savedEntries = localStorage.getItem("freewrite-entries");
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries) as Entry[];
      setEntries(parsed);

      if (parsed.length > 0) {
        setSelectedEntryId(parsed[0].id);
        setText(parsed[0].content);
      } else {
        createNewEntry();
      }
    } else {
      createNewEntry();
    }
  };

  // Load selected entry content
  const loadEntry = (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      setText(entry.content);
      setSelectedEntryId(entryId);
    }
  };

  // Delete entry
  const deleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter((e) => e.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem("freewrite-entries", JSON.stringify(updatedEntries));

    if (selectedEntryId === entryId) {
      if (updatedEntries.length > 0) {
        setSelectedEntryId(updatedEntries[0].id);
        setText(updatedEntries[0].content);
      } else {
        createNewEntry();
      }
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse time input into seconds
  const parseTimeInput = (input: string): number => {
    const parts = input.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return 900; // Default to 15 minutes
  };

  // Handle timer input change
  const handleTimerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimerInput(e.target.value);
  };

  // Handle timer input blur
  const handleTimerInputBlur = () => {
    const seconds = parseTimeInput(timerInput);
    setTimeRemaining(seconds);
    setEditingTimer(false);
  };

  // Handle timer input key press
  const handleTimerInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const seconds = parseTimeInput(timerInput);
      setTimeRemaining(seconds);
      setEditingTimer(false);
    } else if (e.key === "Escape") {
      setTimerInput(formatTime(timeRemaining));
      setEditingTimer(false);
    }
  };

  // Timer functionality
  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    // Reset to the last user-set duration
    setTimeRemaining(lastSetDuration);
    setTimerInput(formatTime(lastSetDuration)); // Update the display too

    // Make sure timer is stopped before starting it again
    setTimerRunning(false);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.error("Failed to enter fullscreen", err));
    } else {
      document
        .exitFullscreen()
        .catch((err) => console.error("Failed to exit fullscreen", err));
    }
  };

  // Load entries and settings on initial render
  useEffect(() => {
    loadEntries();

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem("freewrite-sidebar-visible");
    if (savedSidebarState !== null) {
      setShowSidebar(savedSidebarState === "true");
    }

    // Load dark mode state from localStorage
    const savedDarkMode = localStorage.getItem("freewrite-dark-mode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    }

    // Load RTL mode state from localStorage
    const savedRtlMode = localStorage.getItem("freewrite-rtl-mode");
    if (savedRtlMode !== null) {
      setRtlMode(savedRtlMode === "true");
    }

    // Set random placeholder
    setPlaceholderText(
      placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)]
    );

    // Focus textarea
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem("freewrite-sidebar-visible", showSidebar.toString());
  }, [showSidebar]);

  // Save dark mode state when it changes
  useEffect(() => {
    localStorage.setItem("freewrite-dark-mode", darkMode.toString());
  }, [darkMode]);

  // Save RTL mode state when it changes
  useEffect(() => {
    localStorage.setItem("freewrite-rtl-mode", rtlMode.toString());
  }, [rtlMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle RTL mode
  const toggleRtlMode = () => {
    setRtlMode(!rtlMode);
  };

  // Calculate line height based on font size
  const lineHeight = fontSize * 1.5;

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
      }`}
    >
      {/* Fullscreen button */}
      <button
        onClick={toggleFullScreen}
        className={`absolute top-4 right-4 z-50 p-2 rounded-md shadow hover:bg-opacity-80 transition ${
          darkMode
            ? "bg-gray-800 text-gray-200 border border-gray-700"
            : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
        }`}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          // Exit fullscreen icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-fullscreen-exit"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z" />
          </svg>
        ) : (
          // Enter fullscreen icon
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-fullscreen"
            viewBox="0 0 16 16"
          >
            <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`w-64 border-r ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        } transition-all duration-300 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative h-full z-10 ${
          showSidebar ? "block" : "hidden md:block md:hidden"
        }`}
      >
        <div
          className={`p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } flex justify-between items-center`}
        >
          <h2 className="text-lg font-medium">Notes</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={createNewEntry}
              className={`p-1 rounded ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
              title="New Note"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Entries list */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 border-b ${
                darkMode ? "border-gray-700" : "border-gray-100"
              } cursor-pointer ${
                selectedEntryId === entry.id
                  ? darkMode
                    ? "bg-gray-700"
                    : "bg-gray-100"
                  : darkMode
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => loadEntry(entry.id)}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {entry.date}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEntry(entry.id);
                  }}
                  className={`${
                    darkMode
                      ? "text-gray-500 hover:text-gray-300"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Delete note"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } truncate`}
              >
                {entry.previewText || "Empty note"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative overflow-hidden w-full">
        {/* Sidebar peek indicator (only visible when sidebar is hidden on desktop) */}
        <div
          className={`absolute left-0 top-20 h-24 w-1 ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          } cursor-pointer rounded-r hover:w-2 transition-all duration-200 ${
            !showSidebar ? "md:block hidden" : "hidden"
          }`}
          onClick={() => setShowSidebar(true)}
          title="Show notes"
        ></div>

        {/* Editor */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div
            className={`w-full max-w-3xl px-4 pt-16 pb-20 relative ${
              showSidebar ? "md:ml-64" : ""
            } transition-all duration-300`}
          >
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full h-full resize-none outline-none ${
                darkMode
                  ? "bg-gray-900 text-gray-200"
                  : "bg-white text-gray-800"
              }`}
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                lineHeight: `${lineHeight}px`,
                color: darkMode ? "white" : "black",
                background: darkMode ? "#111827" : "white",
                direction: rtlMode ? "rtl" : "ltr",
                textAlign: rtlMode ? "right" : "left",
              }}
              placeholder={placeholderText}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Bottom controls */}
        <div
          className={`border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } p-3 flex justify-between items-center transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Font controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className={`text-sm ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 dark-select"
                    : "bg-transparent"
                } p-1 rounded border ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
                style={{
                  WebkitAppearance: darkMode ? "none" : undefined,
                  MozAppearance: darkMode ? "none" : undefined,
                  appearance: darkMode ? "none" : undefined,
                  backgroundImage: darkMode
                    ? 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e5e7eb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")'
                    : undefined,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "0.65em",
                  paddingRight: darkMode ? "1.5rem" : undefined,
                }}
              >
                {fontSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className={`text-sm ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 dark-select"
                    : "bg-transparent"
                } p-1 rounded border ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
                style={{
                  WebkitAppearance: darkMode ? "none" : undefined,
                  MozAppearance: darkMode ? "none" : undefined,
                  appearance: darkMode ? "none" : undefined,
                  backgroundImage: darkMode
                    ? 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23e5e7eb%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")'
                    : undefined,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.5rem center",
                  backgroundSize: "0.65em",
                  paddingRight: darkMode ? "1.5rem" : undefined,
                }}
              >
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode toggle */}
            <button
              className={`${
                darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              } p-1`}
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* RTL Mode toggle */}
            <button
              className={`${
                darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              } p-1`}
              onClick={toggleRtlMode}
              title={rtlMode ? "Switch to LTR" : "Switch to RTL"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Sidebar toggle */}
            <button
              className={`${
                darkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              } p-1`}
              onClick={() => setShowSidebar(!showSidebar)}
              title={showSidebar ? "Hide notes" : "Show notes"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
