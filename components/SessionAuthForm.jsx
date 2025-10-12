import { useState } from 'react';
import { Lock, User, Briefcase, Check, AlertCircle, Stethoscope } from 'lucide-react';

export default function SessionAuthForm() {
  const [formData, setFormData] = useState({
    sessionName: '',
    userName: '',
    userRole: '',
    sessionPasscode: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', color: 'blue' },
    { id: 'patient', label: 'Patient', icon: '👤', color: 'green' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sessionName.trim()) {
      newErrors.sessionName = 'Session name is required';
    }
    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }
    if (!formData.userRole) {
      newErrors.userRole = 'Please select a role';
    }
    if (!formData.sessionPasscode.trim()) {
      newErrors.sessionPasscode = 'Passcode is required';
    } else if (formData.sessionPasscode.length < 4) {
      newErrors.sessionPasscode = 'Passcode must be at least 4 characters';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({
      ...prev,
      userRole: roleId
    }));
    if (errors.userRole) {
      setErrors(prev => ({
        ...prev,
        userRole: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      console.log('Session Data:', formData);
    }, 1500);
  };

  const handleReset = () => {
    setFormData({
      sessionName: '',
      userName: '',
      userRole: '',
      sessionPasscode: ''
    });
    setSubmitted(false);
    setErrors({});
  };

  const selectedRole = roles.find(r => r.id === formData.userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Card */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Session Access
          </h1>
          <p className="text-center text-gray-500 text-sm">
            Enter your credentials to continue
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          
          {!submitted ? (
            <div className="space-y-6">
              {/* Session Name Field */}
              <div>
                <label htmlFor="sessionName" className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Session Name
                  </div>
                </label>
                <input
                  type="text"
                  id="sessionName"
                  name="sessionName"
                  value={formData.sessionName}
                  onChange={handleChange}
                  placeholder="Enter your session name"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                    errors.sessionName 
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors.sessionName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.sessionName}
                  </p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="userName" className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Username
                  </div>
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                    errors.userName 
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors.userName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.userName}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Select Your Role
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                        formData.userRole === role.id
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-2 text-center">{role.icon}</div>
                      <p className={`text-sm font-semibold text-center ${
                        formData.userRole === role.id ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {role.label}
                      </p>
                    </button>
                  ))}
                </div>
                {errors.userRole && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.userRole}
                  </p>
                )}
              </div>

              {/* Passcode Field */}
              <div>
                <label htmlFor="sessionPasscode" className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Session Passcode
                  </div>
                </label>
                <input
                  type="password"
                  id="sessionPasscode"
                  name="sessionPasscode"
                  value={formData.sessionPasscode}
                  onChange={handleChange}
                  placeholder="Enter your passcode"
                  className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none ${
                    errors.sessionPasscode 
                      ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors.sessionPasscode && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.sessionPasscode}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-green-700 font-semibold">Success!</p>
                  <p className="text-green-600 text-sm">Your session has been authenticated</p>
                </div>
              </div>

              {/* Submitted Data */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">Session Name</p>
                      <p className="text-gray-800 font-mono text-sm break-all">{formData.sessionName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">Username</p>
                      <p className="text-gray-800 font-mono text-sm break-all">{formData.userName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">User Role</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl">{selectedRole?.icon}</span>
                        <p className="text-gray-800 font-mono text-sm">{selectedRole?.label}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">Passcode</p>
                      <p className="text-gray-800 font-mono text-sm">{'•'.repeat(formData.sessionPasscode.length)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Create New Session
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2024 Session Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
}