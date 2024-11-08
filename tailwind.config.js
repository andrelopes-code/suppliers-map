// tailwind.config.js
module.exports = {
  content: ["./templates/**/*.html", "./static/src/**/*.js"],
  theme: {
    extend: {
      colors: {
        highlight: "var(--highlight)",
      },
    },
  },
  plugins: [],
};
