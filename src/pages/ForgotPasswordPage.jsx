import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      setEmailSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      // Even on error, show success message for security (don't reveal if email exists)
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gradient-to-br dark:from-purple-500 dark:via-purple-600 dark:to-indigo-700 p-4">
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex items-center justify-center">
              <img src={logo} alt="DineFesto Logo" className="w-48 h-auto mx-auto" />
            </div>
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Password reset instructions sent
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                <Mail className="inline h-4 w-4 mr-1" />
                We've sent a password reset link to:
              </p>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 text-center mt-1">
                {email}
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Check your inbox and spam folder</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Click the reset link in the email</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Create your new password</span>
              </p>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-900 dark:text-yellow-100 text-center">
                ⏰ The reset link will expire in 1 hour for security purposes
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-11"
                variant="default"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
              
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full h-11"
                variant="outline"
              >
                Resend Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gradient-to-br dark:from-purple-500 dark:via-purple-600 dark:to-indigo-700 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center">
            <img src={logo} alt="DineFesto Logo" className="w-48 h-auto mx-auto" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Forgot Password?</CardTitle>
            <CardDescription className="text-base mt-2">
              No worries! Enter your email and we'll send you reset instructions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> For security reasons, you'll receive an email only if this address is registered with us.
              </p>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full h-11"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              🔒 Your security is our priority. The reset link will expire after 1 hour.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
