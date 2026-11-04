import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Movexa handles the information you share through this website.",
  path: "/privacy-policy",
});

const sections: LegalSection[] = [
  {
    heading: "What we collect",
    body: [
      "When you fill in our contact form, we receive what you enter: your name, email address, company, country, the service you are interested in, your budget and timeline, your project description, and any reference link.",
      "Like most websites, our servers also process technical information such as your IP address and browser type. We use it to keep the site running and to protect the form from spam and abuse.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use your inquiry to reply to you, to discuss your project, and to keep a record of that conversation. We do not sell your information, and we do not add you to a marketing list without your agreement.",
    ],
  },
  {
    heading: "Who can see it",
    body: [
      "Your inquiry can be seen by the Movexa team members who handle new projects, and by the service providers that host our website and database, who process it on our behalf.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep inquiries for as long as needed to respond and to manage any resulting work, then delete them or make them anonymous, unless we are legally required to keep them for longer.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can ask us to show you, correct or delete the information we hold about you. Depending on where you live, you may have further rights under local law.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "This public website does not currently use advertising or analytics cookies. If that changes, this policy will be updated first.",
    ],
  },
  {
    heading: "Changes",
    body: ["We may update this policy from time to time. Changes take effect when published here."],
  },
];

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" sections={sections} />;
}
