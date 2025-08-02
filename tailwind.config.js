import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				'primary': {
					50: '#f3f0ff',
					100: '#e8e0ff',
					200: '#d4c0ff',
					300: '#b894ff',
					400: '#9b5fff',
					500: '#73349f',
					600: '#5c2b7f',
					700: '#4a2266',
					800: '#3d1b52',
					900: '#331544',
				},
				'secondary': {
					50: '#fdf0ff',
					100: '#fae0ff',
					200: '#f4c0ff',
					300: '#ed94ff',
					400: '#e55fff',
					500: '#D072D9',
					600: '#b95bc2',
					700: '#9a4a9e',
					800: '#7d3d7f',
					900: '#673266',
				},
				'background': '#f8fafc',
				'foreground': '#1e293b',
				'muted': '#64748b',
				'border': '#e2e8f0',
			},
			fontFamily: {
				'sans': ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
			},
		},
	},
	darkMode: "class",
	plugins: [heroui()],
};
