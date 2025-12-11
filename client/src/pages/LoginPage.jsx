import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Divider,
  Checkbox,
} from '@heroui/react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CubeIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await login({
        email: formData.email,
        password: formData.password
      });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      if (error.errors) {
        const backendErrors = {};
        error.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
      }
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader className="flex flex-col items-center pt-8 pb-0">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
            <CubeIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center">
            Sign in to continue to Roxeleye CRUD
          </p>
        </CardHeader>

        <Divider className="my-4 bg-white/10" />

        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              labelPlacement="outside"
              variant="bordered"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              startContent={
                <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              }
              classNames={{
                label: "text-white font-medium",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "border-white/20 hover:border-purple-400 bg-white/5 backdrop-blur-sm"
              }}
            />

            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              labelPlacement="outside"
              variant="bordered"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              startContent={
                <LockClosedIcon className="w-5 h-5 text-gray-400" />
              }
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  )}
                </button>
              }
              classNames={{
                label: "text-white font-medium",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "border-white/20 hover:border-purple-400 bg-white/5 backdrop-blur-sm"
              }}
            />

            <div className="flex items-center justify-between">
              <Checkbox
                isSelected={formData.remember}
                onValueChange={(value) => handleChange('remember', value)}
                classNames={{
                  label: "text-gray-400 text-sm"
                }}
              >
                Remember me
              </Checkbox>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-12 mt-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              endContent={!loading && <ArrowRightIcon className="w-5 h-5" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-500 text-center">
              <span className="text-purple-400 font-semibold">Demo:</span> Register a new account to get started
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
