"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Github, Twitter, Linkedin, Mail, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      })
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Get in Touch</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Have questions about our sentiment analysis tool? Want to provide feedback or suggest improvements? We'd
                love to hear from you!
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Name
                    </label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Email</p>
                    <a href="mailto:info@sentinews.com" className="text-primary hover:underline">
                      nayanyash11@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Connect With Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://x.com/yashnayan2914"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <Twitter className="h-5 w-5 text-primary" />
                </a>
                <a
                  href="https://github.com/yashnayan8795"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <Github className="h-5 w-5 text-primary" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yash-nayan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary/10 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-primary" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}