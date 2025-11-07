import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Image
              src="/placeholder-logo.png"
              alt="Tuganire News logo"
              width={48}
              height={48}
              className="mx-auto h-12 w-12 mb-2"
              priority
            />
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {params?.error ? (
              <p className="text-sm text-muted-foreground mb-6">Error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">An unexpected error occurred during authentication.</p>
            )}
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
