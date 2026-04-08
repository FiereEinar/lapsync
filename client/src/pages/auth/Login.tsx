import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Timer, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/schemas/auth.schema";
import axiosInstance from "@/api/axios";
import { User } from "@/types/user";

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", formData);
      const user = data.data as User;

      if (!user) {
        form.setError("root", {
          message: "Invalid email or password",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/client");
      }
    } catch (error) {
      console.error("Failed to login", error);
      toast({
        variant: "destructive",
        title: "Failed to login",
        description: error.message || "An error occurred while logging in.",
      });
    }
  };

  return (
    <div className='min-h-screen bg-background flex w-full'>
      {/* Left side - Branding */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-sidebar to-primary/20 relative overflow-hidden'>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

        <div className='relative z-10 flex flex-col justify-center px-12 text-sidebar-foreground'>
          <div className='flex items-center gap-4 mb-8'>
            <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg'>
              <Timer className='w-8 h-8 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-4xl font-bold'>LapSync</h1>
              <p className='text-sidebar-foreground/70'>
                Race Event Management
              </p>
            </div>
          </div>

          <div className='space-y-6 max-w-md'>
            <h2 className='text-3xl font-semibold leading-tight'>
              Track Every Lap.
              <br />
              Celebrate Every Finish.
            </h2>
            <p className='text-sidebar-foreground/80 text-lg'>
              Professional timing and event management for races of all sizes.
              From local fun runs to major marathons.
            </p>

            <div className='flex gap-8 pt-6'>
              <div>
                <div className='text-3xl font-bold text-primary'>500+</div>
                <div className='text-sm text-sidebar-foreground/60'>
                  Events Managed
                </div>
              </div>
              <div>
                <div className='text-3xl font-bold text-primary'>50K+</div>
                <div className='text-sm text-sidebar-foreground/60'>
                  Participants
                </div>
              </div>
              <div>
                <div className='text-3xl font-bold text-primary'>99.9%</div>
                <div className='text-sm text-sidebar-foreground/60'>
                  Accuracy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className='absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl' />
        <div className='absolute top-20 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl' />
      </div>

      {/* Right side - Login Form */}
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-3 mb-8 justify-center'>
            <div className='w-12 h-12 bg-primary rounded-xl flex items-center justify-center'>
              <Timer className='w-6 h-6 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-foreground'>LapSync</h1>
              <p className='text-xs text-muted-foreground'>
                Race Event Management
              </p>
            </div>
          </div>

          <Card className='border-0 shadow-xl'>
            <CardHeader className='space-y-1 pb-6'>
              <CardTitle className='text-2xl font-bold'>Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='you@example.com'
                            type='email'
                            autoComplete='email'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              placeholder='Enter your password'
                              type={showPassword ? "text" : "password"}
                              autoComplete='current-password'
                              {...field}
                            />
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className='h-4 w-4 text-muted-foreground' />
                              ) : (
                                <Eye className='h-4 w-4 text-muted-foreground' />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormMessage>
                    {form.formState.errors.root?.message}
                  </FormMessage>

                  <div className='flex items-center justify-end'>
                    <Link
                      to='/forgot-password'
                      className='text-sm text-primary hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type='submit'
                    className='w-full'
                    size='lg'
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      "Signing in..."
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className='w-4 h-4 ml-2' />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className='mt-6 text-center text-sm'>
                <span className='text-muted-foreground'>
                  Don't have an account?{" "}
                </span>
                <Link
                  to='/signup'
                  className='text-primary font-medium hover:underline'
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className='text-center text-xs text-muted-foreground mt-6'>
            By signing in, you agree to our{" "}
            <Link to='/terms' className='underline hover:text-foreground'>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to='/privacy' className='underline hover:text-foreground'>
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
