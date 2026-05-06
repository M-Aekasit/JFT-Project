import { redirect } from "next/navigation";

export default function LineHomePage({ params }) {
  redirect(`/${params.line}/line-maintenance`);
}
