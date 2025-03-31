import { Card } from "@/components/ui/card"

export default function ProjectDetailsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">Project Details</h1>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">AI Model</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our sentiment analysis system uses a state-of-the-art natural language processing (NLP) model based on
              transformer architecture. The model has been fine-tuned specifically for news article analysis, with
              special attention to detecting subtle emotional tones and biases in reporting.
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-slate-800 dark:text-slate-200">Technical Specifications:</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm">
                <li>Architecture: Transformer-based neural network</li>
                <li>Parameters: 175 million</li>
                <li>Training corpus: 15 million news articles</li>
                <li>Sentiment classification accuracy: 92.7%</li>
                <li>Languages supported: English (more coming soon)</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Datasets</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Our model was trained on a diverse collection of news articles from various sources across the political
              spectrum. This ensures that the model can accurately detect sentiment regardless of the publication's
              inherent bias.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Dataset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Time Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Sources
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Primary News Corpus
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      12M articles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      2018-2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      50+ major publications
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Human-Annotated Set
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      100K articles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      2020-2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Expert-labeled
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      Validation Corpus
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      3M articles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      2022-2023
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                      25+ publications
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
                <h3 className="font-medium text-slate-800 dark:text-slate-200">1. Article Extraction</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  When you submit a URL, our system extracts the main content, removing ads, navigation, and other
                  irrelevant elements.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">2. Text Processing</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  The extracted text is tokenized, normalized, and prepared for analysis by our NLP pipeline.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">3. Sentiment Analysis</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Our AI model analyzes the text at both the sentence and document level, identifying emotional tones
                  and biases.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">4. Summary Generation</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  The system generates a concise summary of the article, highlighting key points and their associated
                  sentiments.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">5. Visualization</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Results are presented through intuitive visualizations that make it easy to understand the emotional
                  tone of the article.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Future Development</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We're constantly working to improve our sentiment analysis technology. Here's what's on our roadmap:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  1
                </span>
                <span>Multi-language support for global news analysis</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  2
                </span>
                <span>Historical sentiment tracking for topics and publications over time</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  3
                </span>
                <span>Browser extension for instant analysis while browsing news sites</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  4
                </span>
                <span>API access for developers and researchers</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-3 mt-0.5">
                  5
                </span>
                <span>Enhanced bias detection with political spectrum positioning</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  )
}

