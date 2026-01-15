import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Proof handler is firing
    console.log("LOGIN SUBMIT", { email });

    const res = await login(email, password);

    if (!res.ok) {
      toast({
        title: "Sign in failed",
        description: res.error,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Signed in", description: "Welcome back." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-8">
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="text-gray-300 mt-1">Access challenges and your dashboard.</p>

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
            <Label className="text-white" htmlFor="password">Password</Label>
            <div className="flex items-center">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white rounded-r-none focus-visible:ring-offset-0 placeholder:text-gray-400"
                required
                autoComplete="current-password"
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
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link to="/register" className="text-purple-300 hover:text-purple-200">
            Create an account
          </Link>
          <Link to="/forgot-password" className="text-gray-300 hover:text-white">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
