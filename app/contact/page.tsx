import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex-1">
        <div className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Contact</h1>
          <p className="text-slate-700 leading-relaxed mb-6">Have a question or feedback? Reach out to us and we'll get back to you.</p>
          <div className="space-y-2 text-slate-700">
            <p>Email: <a href="mailto:contact@tuganire.com" className="text-primary underline">contact@tuganire.com</a></p>
            <p>Address: Kigali, Rwanda</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
