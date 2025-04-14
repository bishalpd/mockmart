"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIGNUPDEFAULTVALUES } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: "",
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button disabled={pending} className="w-full" variant={"default"}>
        {pending ? "Submitting..." : "Sign Up"}
      </Button>
    );
  };
  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input type="name" id="name" required autoComplete="name" name="name" defaultValue={SIGNUPDEFAULTVALUES.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" required autoComplete="email" name="email" defaultValue={SIGNUPDEFAULTVALUES.email} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" autoComplete="password" required name="password" defaultValue={SIGNUPDEFAULTVALUES.password} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            id="confirmPassword"
            autoComplete="confirmPassword"
            required
            name="confirmPassword"
            defaultValue={SIGNUPDEFAULTVALUES.confirmPassword}
          />
        </div>
        <div>
          <SignUpButton />
        </div>
        {data && !data.success && <div className="text-center text-destructive">{data.message}</div>}
        <div className="text-sm text-center text-muted-foreground">
          Already have an account ?{" "}
          <Link href={"/sign-in"} target="_self" className="link">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
