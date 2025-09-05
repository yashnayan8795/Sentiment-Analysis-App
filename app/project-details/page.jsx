import { Card } from "@/components/ui/card"

export default function ProjectDetailsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">Project Details</h1>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Current Implementation</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our sentiment analysis system uses FastAPI backend with Next.js frontend to analyze news articles. 
              The system provides real-time sentiment analysis with interactive visualizations.
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-slate-800 dark:text-slate-200">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                <li>Real-time sentiment analysis of news articles</li>
                <li>Interactive sentiment meter with color-coded feedback</li>
                <li>Detailed sentiment breakdown visualization</li>
                <li>Recent analyses history tracking</li>
                <li>Dark/Light theme support</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Technical Stack</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Technology
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Frontend
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Next.js, JavaScript, Tailwind CSS
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Backend
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      FastAPI, Python
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Database
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      MongoDB
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">How It Works</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">1. URL Input</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Users input a news article URL through the clean, responsive interface.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">2. Content Analysis</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  The FastAPI backend extracts and analyzes the article content using NLP models.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">3. Visualization</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Results are displayed through an interactive sentiment meter and breakdown chart.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">4. History Tracking</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Analysis results are stored in MongoDB for future reference and tracking.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Upcoming Features</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We have several exciting features planned for future updates:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  1
                </span>
                <span>Power BI integration for advanced analytics and trends</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  2
                </span>
                <span>Enhanced visualization with more detailed breakdowns</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  3
                </span>
                <span>User authentication and personalized history</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  4
                </span>
                <span>Batch analysis of multiple articles</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  5
                </span>
                <span>API endpoints for third-party integration</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  )
}