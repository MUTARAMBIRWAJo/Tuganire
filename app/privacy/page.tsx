import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-slate-700 leading-relaxed mb-8">We value your privacy. This policy explains what data we collect, how we use it, how long we keep it, and the rights you have over your information.</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Account data (name, email) when you sign up or log in</li>
              <li>Content you submit (comments, articles if applicable)</li>
              <li>Usage data (pages viewed, referring URLs, approximate location)</li>
              <li>Device and technical data (browser, OS, IP address)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Provide and improve the Tuganire News platform</li>
              <li>Personalize content and measure engagement</li>
              <li>Communicate updates, newsletters, and service notices</li>
              <li>Maintain safety, prevent abuse, and comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>
            <p className="text-slate-700">We retain personal data only for as long as necessary to provide services, comply with legal requirements, and resolve disputes. We periodically review and anonymize or delete data that is no longer needed.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Cookies and Similar Technologies</h2>
            <p className="text-slate-700 mb-2">We use cookies and similar technologies to keep you logged in, remember preferences, and analyze traffic.</p>
            <p className="text-slate-700">You can manage cookies through your browser settings; disabling cookies may affect some site features.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request corrections or deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Withdraw consent (for communications) at any time</li>
            </ul>
            <p className="text-slate-700 mt-3">To exercise your rights, contact us at <a className="text-primary underline" href="mailto:privacy@tuganire.com">privacy@tuganire.com</a>.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
