import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import NavBar from "@/components/nav-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "News Sentiment Analyzer",
  description: "Analyze the sentiment of news articles with AI",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}