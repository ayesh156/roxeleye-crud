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
  Progress,
} from '@heroui/react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CubeIcon,
  ArrowRightIcon,
  UserIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Password strength calculator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength) => {
    if (strength < 30) return 'danger';
    if (strength < 60) return 'warning';
    if (strength < 80) return 'primary';
    return 'success';
  };

  const getStrengthLabel = (strength) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password
      });
      toast.success('Account created successfully!');
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        {/* Floating orbs */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader className="flex flex-col items-center pt-8 pb-0">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <CubeIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-center">
            Join Roxeleye CRUD and start managing your inventory
          </p>
        </CardHeader>

        <Divider className="my-4 bg-white/10" />

        <CardBody className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your name"
              labelPlacement="outside"
              variant="bordered"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              startContent={
                <UserIcon className="w-5 h-5 text-gray-400" />
              }
              classNames={{
                label: "text-white font-medium",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "border-white/20 hover:border-indigo-400 bg-white/5 backdrop-blur-sm"
              }}
            />

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
                inputWrapper: "border-white/20 hover:border-indigo-400 bg-white/5 backdrop-blur-sm"
              }}
            />

            <div className="space-y-2">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Create a password"
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
                  inputWrapper: "border-white/20 hover:border-indigo-400 bg-white/5 backdrop-blur-sm"
                }}
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1">
                  <Progress
                    size="sm"
                    value={passwordStrength}
                    color={getStrengthColor(passwordStrength)}
                    className="h-1"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium text-${getStrengthColor(passwordStrength)}`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Confirm your password"
              labelPlacement="outside"
              variant="bordered"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              startContent={
                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
              }
              endContent={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                  )}
                </button>
              }
              classNames={{
                label: "text-white font-medium",
                input: "text-white placeholder:text-white/60",
                inputWrapper: "border-white/20 hover:border-indigo-400 bg-white/5 backdrop-blur-sm"
              }}
            />

            <div className="flex flex-col gap-1">
              <Checkbox
                isSelected={agreedToTerms}
                onValueChange={setAgreedToTerms}
                classNames={{
                  label: "text-gray-400 text-sm"
                }}
              >
                I agree to the{' '}
                <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">
                  Privacy Policy
                </Link>
              </Checkbox>
              {errors.terms && (
                <span className="text-xs text-danger">{errors.terms}</span>
              )}
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-12 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
              endContent={!loading && <ArrowRightIcon className="w-5 h-5" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Role info */}
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">
                  <span className="text-indigo-400 font-semibold">New accounts</span> are created with User role. 
                  Contact an administrator to upgrade to Admin privileges.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
