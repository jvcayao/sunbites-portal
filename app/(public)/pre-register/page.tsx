import type { Metadata } from "next";

import { PreRegistrationForm } from "@/components/pre-registration/pre-registration-form";

export const metadata: Metadata = {
  title: "Pre-Register Your Child | Sunbites",
  description:
    "Submit a pre-registration for your child to enroll at Sunbites canteen.",
};

export default function PreRegisterPage() {
  return (
    <main className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Pre-Register Your Child
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill in the form below to pre-register your child for Sunbites
            canteen enrollment. Our staff will review your submission and
            contact you.
          </p>
        </div>
        <PreRegistrationForm />
      </div>
    </main>
  );
}
