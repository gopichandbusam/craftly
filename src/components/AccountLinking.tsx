import React, { useState } from 'react';
import { Link, Unlink, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AccountLinking: React.FC = () => {
  const { user, linkGoogleAccount, unlinkProvider } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleLinkGoogle = async () => {
    if (user.hasGoogleProvider) return;
    
    setIsLinking(true);
    setMessage(null);
    
    try {
      const result = await linkGoogleAccount();
      if (result.success) {
        setMessage({ type: 'success', text: 'Google account linked successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to link account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    setIsUnlinking(providerId);
    setMessage(null);
    
    try {
      const result = await unlinkProvider(providerId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Account unlinked successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to unlink account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsUnlinking(null);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Link size={20} className="mr-2 text-blue-500" />
        Linked Accounts
      </h3>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} className="mr-2" /> : <AlertCircle size={16} className="mr-2" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Email/Password Account */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Mail size={20} className="text-gray-600 mr-3" />
            <div>
              <p className="font-medium text-gray-800">Email & Password</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            {user.hasEmailProvider ? (
              <>
                <CheckCircle size={16} className="text-green-500 mr-2" />
                <span className="text-sm text-green-600 mr-3">Linked</span>
                {user.linkedProviders.length > 1 && (
                  <button
                    onClick={() => handleUnlinkProvider('password')}
                    disabled={isUnlinking === 'password'}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 flex items-center"
                  >
                    {isUnlinking === 'password' ? (
                      <Loader size={14} className="animate-spin mr-1" />
                    ) : (
                      <Unlink size={14} className="mr-1" />
                    )}
                    Unlink
                  </button>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500">Not linked</span>
            )}
          </div>
        </div>

        {/* Google Account */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <p className="font-medium text-gray-800">Google Account</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            {user.hasGoogleProvider ? (
              <>
                <CheckCircle size={16} className="text-green-500 mr-2" />
                <span className="text-sm text-green-600 mr-3">Linked</span>
                {user.linkedProviders.length > 1 && (
                  <button
                    onClick={() => handleUnlinkProvider('google.com')}
                    disabled={isUnlinking === 'google.com'}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 flex items-center"
                  >
                    {isUnlinking === 'google.com' ? (
                      <Loader size={14} className="animate-spin mr-1" />
                    ) : (
                      <Unlink size={14} className="mr-1" />
                    )}
                    Unlink
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleLinkGoogle}
                disabled={isLinking}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
              >
                {isLinking ? (
                  <Loader size={14} className="animate-spin mr-1" />
                ) : (
                  <Link size={14} className="mr-1" />
                )}
                Link Google
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Account Linking Benefits:</strong>
          <br />• Sign in with either email/password or Google
          <br />• Secure access to the same data with multiple methods
          <br />• Easy account recovery options
        </p>
      </div>
    </div>
  );
};

export default AccountLinking;