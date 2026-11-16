import type { Metadata } from "next"
import { ForginityLogo } from "@workspace/ui/components/forginity-logo"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Admin Sign in · Forginity Console",
  description: "Sign in to the Forginity administrator workspace",
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col lg:flex-row bg-[#090909] text-[#f6f6f6] selection:bg-[#ff6347]/30 selection:text-[#f6f6f6] overflow-y-auto lg:overflow-hidden">
      {/* ============================================================== */}
      {/* LEFT COLUMN: Organization Introduction (Desktop)               */}
      {/* ============================================================== */}
      <section
        aria-label="Organization overview"
        className="hidden lg:flex w-[42%] max-w-[620px] shrink-0 flex-col justify-between border-r border-[#292929] bg-[#0e0e0e] p-10 xl:p-16 relative"
      >
        {/* Top Branding */}
        <div>
          <ForginityLogo
            size="custom"
            width={160}
            height={44}
            className="text-[#f6f6f6]"
          />
        </div>

        {/* Hero Narrative */}
        <div className="my-auto space-y-4 py-10">
          <h1 className="text-4xl xl:text-[44px] font-light text-[#f6f6f6] leading-[1.25] tracking-tight">
            One workspace.
            <br />
            Every possibility.
          </h1>
          <p className="text-base font-normal text-[#a1a1a1] leading-relaxed max-w-[480px]">
            Manage your products, people, and progress
            <br />
            from the Forginity admin portal.
          </p>
        </div>

        {/* Left Footer */}
        <div className="pt-6">
          <p className="text-xs font-normal text-[#858585]">© 2026 Forginity</p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: Admin Sign-in Form (Mobile & Desktop)           */}
      {/* ============================================================== */}
      <section
        aria-label="Admin sign-in"
        className="flex flex-1 flex-col justify-between bg-[#090909] p-6 sm:p-10 lg:p-16 min-h-screen lg:min-h-0 overflow-y-auto"
      >
        {/* Mobile Header Branding */}
        <div className="flex lg:hidden items-center justify-between pb-6 border-b border-[#292929]/50">
          <ForginityLogo
            size="custom"
            width={130}
            height={36}
            className="text-[#f6f6f6]"
          />
          <span className="text-[11px] font-medium tracking-wider uppercase text-[#a1a1a1]">
            ADMIN PORTAL
          </span>
        </div>

        {/* Desktop Header Overline */}
        <div className="hidden lg:block">
          <p className="text-xs font-normal tracking-wider uppercase text-[#a1a1a1]">
            FORGINITY / ADMIN PORTAL
          </p>
        </div>

        {/* Centered Sign-in Form Area */}
        <div className="my-auto flex w-full flex-col items-center justify-center py-8">
          <div className="w-full max-w-[400px]">
            <LoginForm />
          </div>
        </div>

        {/* Bottom Security & Support Information */}
        <div className="mx-auto w-full max-w-[400px] space-y-2 pt-6 text-center text-xs">
          <p className="text-[#858585]">
            Access is limited to authorized administrators.
          </p>
          <p className="text-[#a1a1a1]">
            Need access? Contact your organization admin.
          </p>
        </div>
      </section>
    </main>
  )
}
