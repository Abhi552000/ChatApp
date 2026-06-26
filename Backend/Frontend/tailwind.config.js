/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        themeBgPrimary: "var(--bg-primary)",
        themeBgSecondary: "var(--bg-secondary)",
        themeBgHeader: "var(--bg-header)",
        themeBgHover: "var(--bg-hover)",
        themeTextPrimary: "var(--text-primary)",
        themeTextSecondary: "var(--text-secondary)",
        themeBorder: "var(--border-color)",
        themeBgInput: "var(--bg-input)",
        themeBgChatUser: "var(--bg-chat-user)",
        themeBgMsgSent: "var(--bg-message-sent)",
        themeBgMsgRecv: "var(--bg-message-received)",
        themeTextMsg: "var(--text-message)",
      }
    },
  },
  plugins: [require("daisyui")],
};