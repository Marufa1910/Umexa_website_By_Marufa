import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms",
  description: "The terms that apply when you use the UMEXA website.",
  path: "/terms",
});

const sections: LegalSection[] = [
  {
    heading: "Using this website",
    body: [
      "By using this website, you agree to these terms. Please use it lawfully, and do not attempt to disrupt it, gain unauthorized access to it, or misuse its contact form.",
    ],
  },
  {
    heading: "Our content",
    body: [
      "The design, text, images and video on this website belong to UMEXA or its licensors, unless stated otherwise. You may view and share links to it, but may not reuse it commercially without written permission.",
    ],
  },
  {
    heading: "Project work",
    body: [
      "Nothing on this website is a binding offer. Any project, retainer or partnership is governed by a separate written agreement, which takes priority over these terms.",
    ],
  },
  {
    heading: "Accuracy",
    body: [
      "We aim to keep this website accurate and available, but provide it as is, and make no promise that it will always be complete, current or uninterrupted.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "To the extent permitted by law, UMEXA is not liable for indirect or consequential loss arising from your use of this website.",
    ],
  },
  {
    heading: "Other websites",
    body: [
      "Links to other websites are provided for convenience. We are not responsible for their content or practices.",
    ],
  },
  {
    heading: "Changes",
    body: ["We may update these terms from time to time. Changes take effect when published here."],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms" sections={sections} />;
}
