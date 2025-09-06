import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-slate-800 dark:text-slate-100">
          About Us
        </h1>

        <Card className="p-8 mb-8 shadow-lg rounded-xl">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
            Our Mission
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            At SentiNews, our mission is to empower readers with AI-driven sentiment analysis of news articles. We aim to enhance media literacy by providing insights into the emotional tone and biases within news content, helping users navigate the modern information landscape with clarity and critical thinking.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[
              { name: "Yash Nayan", role: "22BDS0274" }
            ].map((member, index) => (
              <div key={index} className="border rounded-lg p-5 shadow-md bg-white dark:bg-slate-800">
                <h3 className="font-medium text-lg mb-1 text-slate-800 dark:text-slate-100">
                  {member.name}
                </h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
            Our Story
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            SentiNews started as an academic research project aimed at exploring how AI can detect sentiment and bias in news reporting. What began as a university initiative soon grew into a powerful tool for media analysis. Today, we continue to refine our AI technology, striving to make sentiment analysis more accessible and valuable for all news consumers.
          </p>
        </Card>
      </div>
    </main>
  );
}