"use client";

import { createBrowserClient } from "@supabase/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthForm from "@/components/auth-form-body";
import { authFormSchema } from "@/lib/utils";
import { AuthFormType } from "@/types";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function Signup() {
  const { toast } = useToast();
  const [signedUp, setSignedUp] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const form = useForm<AuthFormType>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: AuthFormType) {
    const { data, error } = await supabase.auth.signUp(values);

    if (data && !error) {
      setSignedUp(true);
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: error.message,
      });
    }
  }

  if (signedUp) {
  }

  return (
    <div className="mx-auto max-w-2xl mt-36">
      {signedUp ? (
        <div className="text-center">
          Please go to your email and verify your account
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AuthForm form={form} />
            <div className="flex justify-center space-x-8">
              <Button className="px-16" type="submit">
                Signup
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
