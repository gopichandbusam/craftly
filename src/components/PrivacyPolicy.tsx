import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6 bg-white/50 px-4 py-2 rounded-xl hover:bg-white/70"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to App
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 border border-white/20">
          <div className="text-center mb-8">
            <Shield size={48} className="text-blue-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Eye className="mr-3 text-blue-500" size={24} />
                Information We Collect
              </h2>
              <div className="bg-blue-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Name, email address, and phone number from your resume</li>
                  <li>Authentication information (Google OAuth or email/password)</li>
                  <li>Resume content and job application data</li>
                  <li>Usage analytics and app interaction data</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP address, browser type, and device information</li>
                  <li>App usage patterns and feature interactions</li>
                  <li>Error logs and performance data</li>
                  <li>Firebase Analytics data</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Database className="mr-3 text-green-500" size={24} />
                How We Use Your Information
              </h2>
              <div className="bg-green-50 rounded-lg p-6">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Resume Processing:</strong> To parse and extract information from uploaded resumes</li>
                  <li><strong>Cover Letter Generation:</strong> To create personalized cover letters using AI</li>
                  <li><strong>Account Management:</strong> To provide secure access to your data</li>
                  <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our AI models</li>
                  <li><strong>Communication:</strong> To send important service updates (opt-out available)</li>
                  <li><strong>Security:</strong> To detect and prevent fraud and abuse</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Shield className="mr-3 text-orange-500" size={24} />
                Data Protection & Security
              </h2>
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">Security Measures</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Secure Firebase authentication and storage</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Limited access controls for our team</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mb-2">Data Retention</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Resume data: Stored until you delete your account</li>
                  <li>Analytics data: Aggregated and anonymized after 14 months</li>
                  <li>Account data: Deleted within 30 days of account deletion</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Cookie className="mr-3 text-yellow-500" size={24} />
                Cookies & Tracking
              </h2>
              <div className="bg-yellow-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Essential Cookies:</strong> For authentication and security</li>
                  <li><strong>Analytics Cookies:</strong> To understand app usage (Google Analytics)</li>
                  <li><strong>Performance Cookies:</strong> To optimize app performance</li>
                  <li><strong>Local Storage:</strong> To cache your data locally for offline access</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Third-Party Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Google Services</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Firebase (data storage)</li>
                    <li>• Google Analytics (usage tracking)</li>
                    <li>• Google OAuth (authentication)</li>
                    <li>• Gemini AI (content generation)</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Other Services</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• PDF.js (document processing)</li>
                    <li>• jsPDF (PDF generation)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Rights</h2>
              <div className="bg-indigo-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Objection:</strong> Object to processing of your personal data</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Mail className="mr-3 text-red-500" size={24} />
                Contact Us
              </h2>
              <div className="bg-red-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For privacy-related questions or to exercise your rights, contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@gopichand.me</p>
                  <p><strong>Developer:</strong> Gopichand Busam</p>
                  <p><strong>Response Time:</strong> Within 72 hours</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Updates to This Policy</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the "Last updated" date. 
                  Continued use of the service after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;