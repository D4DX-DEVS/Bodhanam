import IssueForm from "@/app/admin/_components/IssueForm";

export const metadata = {
  title: "New Issue · Admin",
};

export default function NewIssuePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-ink mb-8">New Issue</h1>
      <IssueForm />
    </div>
  );
}
