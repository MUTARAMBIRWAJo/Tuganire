import { redirect } from "next/navigation"

interface EditRedirectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRedirectPage({ params }: EditRedirectPageProps) {
  const { id } = await params
  redirect(`/dashboard/articles/${id}/edit`)
}
