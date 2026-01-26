import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Eye, EyeOff, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError(true);
      toast.error('Invalid reset link');
    }
  }, [token]);

  const validatePassword = () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });

      setResetSuccess(true);
      toast.success('Password reset successful!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to reset password. The link may be expired.';
      toast.error(errorMessage);
      
      if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
        setTokenError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gradient-to-br dark:from-purple-500 dark:via-purple-600 dark:to-indigo-700 p-4">
        <Card className="w-full max-w-md shadow-2xl border-2">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex items-center justify-center">
              <img src={logo} alt="DineFesto Logo" className="w-48 h-auto mx-auto" />
            </div>
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                Invalid or Expired Link
              </CardTitle>
              <CardDescription className="text-base mt-2">
                This password reset link is no longer valid
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-900 dark:text-red-100 text-center">
                Password reset links expire after 1 hour for security purposes.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full h-11"
              >
                Request New Reset Link
              </Button>
              
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-11"
                variant="outline"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
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
                Password Reset Successful!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Your password has been changed successfully
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-900 dark:text-green-100 text-center">
                ✅ You can now login with your new password
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full h-11"
            >
              Continue to Login
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Redirecting automatically in 3 seconds...
            </p>
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
            <CardTitle className="text-3xl font-bold">Create New Password</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your new password below
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="h-11 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                  className="h-11 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {newPassword && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-100 mb-2">
                  <strong>Password Requirements:</strong>
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li className={newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                    {newPassword.length >= 6 ? '✅' : '⭕'} At least 6 characters
                  </li>
                  <li className={newPassword === confirmPassword && confirmPassword ? 'text-green-600 dark:text-green-400' : ''}>
                    {newPassword === confirmPassword && confirmPassword ? '✅' : '⭕'} Passwords match
                  </li>
                </ul>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full h-11"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              🔒 Make sure to use a strong, unique password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;
