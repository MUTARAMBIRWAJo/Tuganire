import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SiteHeader />

      <main className="flex-1">
        <div className="max-w-6xl xl:max-w-7xl mx-auto sm:p-6 md:p-8">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-slate-700 leading-relaxed mb-10">We are a news platform committed to delivering timely, accurate, and engaging stories across the world, politics, technology, sports, and culture.</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-slate-700 leading-relaxed">Our mission is to inform and empower communities through trustworthy journalism. We strive to highlight underreported stories, promote transparency, and encourage constructive dialogue.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Editorial Standards</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Accuracy and verification of sources</li>
              <li>Clear separation between news and opinion</li>
              <li>Corrections policy for factual errors</li>
              <li>Respect for privacy and public interest</li>
              <li>Transparency around conflicts of interest</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Team</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Editor-in-Chief</h3>
                <p className="text-sm text-slate-600">Leads editorial vision and standards.</p>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Senior Reporter</h3>
                <p className="text-sm text-slate-600">Covers in-depth investigations and long-form stories.</p>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Multimedia Producer</h3>
                <p className="text-sm text-slate-600">Creates visual storytelling across platforms.</p>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <h3 className="font-medium">Community Editor</h3>
                <p className="text-sm text-slate-600">Engages with readers and moderates discussions.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
