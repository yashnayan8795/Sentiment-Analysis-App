import { Card } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">About Us</h1>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            SentiNews is dedicated to providing objective analysis of news articles through advanced AI sentiment
            analysis. Our mission is to help readers understand the emotional tone and bias in news content, promoting
            media literacy and critical thinking in an era of information overload.
          </p>

          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">The Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              {
                name: "Yash Nayan",
                role: "22BDS0274",
                
              },
              {
                name: "Sai Siddhartha",
                role: "22BDS0260",
                
              },
              
            ].map((member, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-lg mb-1 text-slate-800 dark:text-slate-100">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Our Story</h2>
          <p className="text-slate-600 dark:text-slate-300">
            SentiNews began as a research project at a leading university, exploring how AI could be used to detect
            emotional bias in news reporting. What started as an academic pursuit quickly evolved into a practical tool
            that could help everyday readers navigate the complex media landscape. Today, we're committed to
            continuously improving our sentiment analysis technology and making it accessible to everyone who wants to
            better understand the news they consume.
          </p>
        </Card>
      </div>
    </main>
  )
}

