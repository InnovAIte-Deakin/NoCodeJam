import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("REGISTER SUBMIT", { email, username });

    try {
      const res = await register(email, password, username);

      if (!res.ok) {
        console.error("Registration failed:", res.error);
        toast({
          title: "Sign up failed",
          description: res.error || "An unknown error occurred",
          variant: "destructive",
        });
        return;
      }

      console.log("Registration success, redirecting...");
      toast({
        title: "Account created",
        description: "Account created successfully! Redirecting to login...",
      });

      // Short delay to let user see feedback
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      console.error("Unexpected error during registration:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-8">
        <h1 className="text-2xl font-semibold text-white">Join NoCodeJam</h1>
        <p className="text-gray-300 mt-1">Create your account and start building.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label className="text-white" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white" htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white" htmlFor="password">Password</Label>
            <div className="flex items-center">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white rounded-r-none focus-visible:ring-offset-0 placeholder:text-gray-400"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="h-10 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md flex items-center justify-center transition-colors shadow-sm"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-sm">
          <span className="text-gray-300">Already have an account? </span>
          <Link to="/login" className="text-purple-300 hover:text-purple-200">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
