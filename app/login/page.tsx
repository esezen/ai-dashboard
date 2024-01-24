"use client";

import { createBrowserClient } from "@supabase/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthForm from "@/components/auth-form";
import { AuthFormType } from "@/types";
import { authFormSchema } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AuthFormType>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: AuthFormType) {
    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (data && !error) {
      router.replace("/");
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message,
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl mt-36">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <AuthForm form={form} />
          <div className="flex justify-center space-x-8">
            <Button className="px-16" type="submit">
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
