"use client";

function slugify(s: string): string {
  return (
    (s || "doc")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "doc"
  );
}

export function downloadPrepHtml(html: string, company: string, roleTitle: string): void {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(company)}-${slugify(roleTitle)}-interview-prep.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
