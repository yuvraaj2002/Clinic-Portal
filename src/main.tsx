import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<HeroUIProvider>
			<AuthProvider>
				<main className="text-foreground bg-background">
					<App />
				</main>
			</AuthProvider>
		</HeroUIProvider>
	</React.StrictMode>
);
