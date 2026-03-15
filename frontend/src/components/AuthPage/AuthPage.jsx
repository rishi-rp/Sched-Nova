import { useState } from "react";
import api from "../../Api/api";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { setAccessToken, clearAccessToken } from "../../auth/token";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";




const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const redirectPath =
    params.get("redirect") ||
    location.state?.from ||
    "/welcome";



    const validateForm = () => {
        setError('');

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
        }

        if (!isLogin) {
            if (!formData.name) {
                setError('Name is required');
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }

            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters');
                return false;
            }
        }

        return true;
    };

    // Handle Login
    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password,
            });

            // Save access token
            setAccessToken(res.data.access_token);

            setSuccess("Login successful! Redirecting...");
            
            // Clear form and redirect after 1.5 seconds
            setTimeout(() => {
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                console.log('Redirecting to dashboard...');
                navigate(redirectPath, { replace: true });
                setSuccess('✓ Logged in successfully! Token saved.');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle Sign Up
    const handleSignup = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.post('/auth/signup', {
                username: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // Save JWT token from response
            setAccessToken(res.data.access_token);

            setSuccess('Account created successfully! Redirecting...');
            
            setTimeout(() => {
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                console.log('Redirecting to dashboard...');
                navigate("/welcome", { replace: true });
                setSuccess('✓ Account created! Token saved.');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.detail || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    };

    // Handle Logout (for demo purposes)
    // const handleLogout = async () => {
    //     try {
    //         await api.post("/auth/logout");
    //     } finally {
    //         clearAccessToken();
    //         setSuccess("Logged out successfully");
    //     }
    // };

    // Handle Submit
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (isLogin) {
            await handleLogin();
        } else {
            await handleSignup();
        }
    };

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
        });
        setShowPassword(false);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-between p-4 font-['Segoe_UI',sans-serif] relative overflow-hidden">

            {/* Logo */}
            <div className="flex-1 flex items-center justify-center">
                
                <div className="text-center mb-8 animate-[fadeIn_0.6s_ease-out]">
                    <div className="max-w-lg">
                        <div className="text-center mb-12 animate-[fadeIn_0.6s_ease-out]">
                            <h1 className="text-6xl font-extrabold text-white mb-4 tracking-wide">
                                Sched<span className="text-yellow-300">Nova</span>
                            </h1>
                            <p className="text-purple-200 text-lg mb-2">Smart Scheduling Made Simple</p>
                            <p className="text-purple-300 text-sm max-w-md mx-auto">
                                Streamline your academic scheduling with AI-powered automation and conflict-free timetables
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="space-y-4 animate-[fadeIn_0.8s_ease-out]">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="grid grid-cols-[3rem_1fr] items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-300 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg mb-1">Lightning Fast</h3>
                                        <p className="text-purple-200 text-sm">Generate optimized schedules in seconds with zero conflicts</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="grid grid-cols-[3rem_1fr] items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-300 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg mb-1">Smart & Secure</h3>
                                        <p className="text-purple-200 text-sm">AI-powered algorithms with enterprise-grade security</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                                <div className="grid grid-cols-[3rem_1fr] items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-300 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg mb-1">Team Collaboration</h3>
                                        <p className="text-purple-200 text-sm">Perfect for departments, faculties, and institutions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Auth Container */}
            <div className="relative w-full max-w-md mr-14">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-purple-500/50">
            
                {/* Toggle Tabs */}
                <div className="flex gap-2 mb-8 bg-purple-100 rounded-full p-1">
                    <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                        isLogin
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-purple-600 hover:bg-purple-200'
                    }`}
                    >
                    Login
                    </button>
                    <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                        !isLogin
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-purple-600 hover:bg-purple-200'
                    }`}
                    >
                    Sign Up
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-sm text-green-700 font-medium">{success}</p>
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-5">
                    
                    {/* Name Field - Only for Sign Up */}
                    <div
                    className={`transition-all duration-500 overflow-hidden ${
                        !isLogin ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    >
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 transition-colors group-focus-within:text-purple-600" />
                        <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white"
                        />
                    </div>
                    </div>

                    {/* Email Field */}
                    <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 transition-colors group-focus-within:text-purple-600" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white"
                    />
                    </div>

                    {/* Password Field */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 transition-colors group-focus-within:text-purple-600" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowPassword((prevShowPassword) => !prevShowPassword)
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Confirm Password - Only for Sign Up */}
                    <div
                    className={`transition-all duration-500 overflow-hidden ${
                        !isLogin ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    >
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 transition-colors group-focus-within:text-purple-600" />
                        <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-purple-200 focus:border-purple-600 focus:outline-none transition-all duration-300 bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword)
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    </div>

                    {/* Forgot Password - Only for Login */}
                    {isLogin && (
                    <div className="flex justify-end animate-[fadeIn_0.3s_ease-out]">
                        <button
                        type="button"
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                        >
                        Forgot Password?
                        </button>
                    </div>
                    )}

                    {/* Submit Button */}
                    <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                        </span>
                    ) : (
                        isLogin ? 'Login' : 'Create Account'
                    )}
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-purple-200"></div>
                    <span className="text-sm text-purple-400 font-medium">OR</span>
                    <div className="flex-1 h-px bg-purple-200"></div>
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                    <button
                    type="button"
                    className="w-full py-3 border-2 border-purple-200 rounded-xl font-medium text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                    </button>
                </div>

                {/* Toggle Mode */}
                <p className="text-center mt-6 text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                    type="button"
                    onClick={toggleMode}
                    className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
                    >
                    {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>

                {/* Demo Logout Button */}
                
                    {/* <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full mt-4 py-2 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all duration-300"
                    >
                    Logout (Clear Token)
                    </button> */}

                </div>

                <style>{`
                @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
                }
                input[type="password"]::-ms-reveal,
                input[type="password"]::-ms-clear {
                display: none;
                }

                /* Remove Chrome / Edge (Chromium) autofill eye */
                input[type="password"]::-webkit-textfield-decoration-container {
                visibility: hidden;
                }
            `}</style>
                
            </div>

        </div>

        
    )
}

export default AuthPage