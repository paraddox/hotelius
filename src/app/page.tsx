import Link from 'next/link';
import { ArrowRight, Building2, Calendar, CreditCard, Globe, Shield, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Booking Engine',
    description: 'Real-time availability and dynamic pricing that adapts to demand.',
  },
  {
    icon: Building2,
    title: 'Multi-Property Support',
    description: 'Manage multiple hotels from a single, elegant dashboard.',
  },
  {
    icon: Globe,
    title: 'Multi-Language & Currency',
    description: 'Reach global guests with localized booking experiences.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'PCI-compliant payment processing powered by Stripe.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Row-level security and data isolation for each property.',
  },
  {
    icon: Sparkles,
    title: 'Beautiful Experience',
    description: 'Boutique-quality design that reflects your brand identity.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background-elevated)]/80 backdrop-blur-md border-b border-[var(--color-sand)]">
        <nav className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="font-serif text-2xl font-medium italic text-[var(--color-terracotta)]">
            Hotelius
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]">
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-accent inline-flex items-center gap-2 rounded-md bg-[var(--color-charcoal)] px-5 py-2.5 text-sm font-medium text-[var(--color-pearl)] transition-all hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-md"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cream)] via-[var(--color-cream-dark)] to-[var(--color-sand)]" />

        {/* Decorative Elements */}
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[var(--color-terracotta)]/5 blur-3xl" />
        <div className="absolute left-0 bottom-1/4 h-64 w-64 rounded-full bg-[var(--color-sage)]/5 blur-3xl" />

        <div className="hero-content relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="text-label mb-4 animate-fade-in-down text-[var(--color-terracotta)]">
            Boutique Hotel Management
          </p>
          <h1 className="hero-title mb-6 animate-fade-in-up font-serif text-[var(--foreground)]" style={{ animationDelay: '100ms' }}>
            Elevate Your <span className="italic text-[var(--color-terracotta)]">Hospitality</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl animate-fade-in-up text-lg leading-relaxed text-[var(--foreground-muted)]" style={{ animationDelay: '200ms' }}>
            A refined reservation platform designed for boutique hotels. Manage bookings,
            rooms, and guest experiences with elegance and efficiency.
          </p>
          <div className="flex animate-fade-in-up flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '300ms' }}>
            <Link
              href="/register"
              className="btn group inline-flex items-center gap-2 rounded-md bg-[var(--color-charcoal)] px-8 py-3.5 text-sm font-medium text-[var(--color-pearl)] transition-all hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="btn-secondary inline-flex items-center gap-2 rounded-md border border-[var(--color-sand)] bg-transparent px-8 py-3.5 text-sm font-medium text-[var(--foreground)] transition-all hover:border-[var(--color-terracotta)] hover:bg-[var(--color-cream-dark)]"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[var(--background-elevated)] py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="text-label mb-4 text-[var(--color-terracotta)]">Features</p>
            <h2 className="font-serif text-3xl font-medium text-[var(--foreground)] md:text-4xl">
              Everything You Need to <span className="italic">Succeed</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card group rounded-xl border border-[var(--color-sand)] bg-[var(--background-elevated)] p-8 transition-all duration-300 hover:border-[var(--color-terracotta)] hover:shadow-lg"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(196,164,132,0.1)] transition-colors group-hover:bg-[rgba(196,164,132,0.2)]">
                    <Icon className="h-6 w-6 text-[var(--color-terracotta)]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-medium text-[var(--foreground)]">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--foreground-muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--color-charcoal)] py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 font-serif text-3xl font-medium text-[var(--color-pearl)] md:text-4xl">
            Ready to Transform Your <span className="italic text-[var(--color-terracotta)]">Hotel Operations</span>?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[var(--color-sand)]">
            Join boutique hotels worldwide using Hotelius to deliver exceptional guest experiences.
          </p>
          <Link
            href="/register"
            className="btn group inline-flex items-center gap-2 rounded-md bg-[var(--color-terracotta)] px-8 py-3.5 text-sm font-medium text-[var(--color-pearl)] transition-all hover:bg-[var(--color-terracotta-dark)] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-sand)] bg-[var(--background)] py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Link href="/" className="font-serif text-xl font-medium italic text-[var(--color-terracotta)]">
            Hotelius
          </Link>
          <p className="text-sm text-[var(--foreground-muted)]">
            © {new Date().getFullYear()} Hotelius. Crafted with care for boutique hospitality.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
