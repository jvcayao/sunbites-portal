"use client";

import { use } from "react";
import { StudentDetailShell } from "./_components/student-detail-shell";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <StudentDetailShell studentId={Number(id)} />;
}
