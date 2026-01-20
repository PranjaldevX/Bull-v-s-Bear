/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neon-blue': '#3b82f6', // Generic Blue
                'neon-green': '#00ff9d',
                'neon-red': '#ff0055',
                'theme-bg': '#2d2d2d',
                'theme-surface': '#373737',
                'theme-surface-highlight': '#464646',
                'theme-accent-dark': '#32393d',
                'theme-text-muted': '#bdbdbd',
            }
        },
    },
    plugins: [],
}
