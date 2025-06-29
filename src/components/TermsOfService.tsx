import React from 'react';
import { ArrowLeft, FileText, AlertTriangle, Shield, Gavel } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
            <FileText size={48} className="text-blue-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-700">
                  By accessing and using Craftly AI ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Service Description</h2>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Craftly AI provides AI-powered resume parsing and cover letter generation services, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Resume upload and intelligent parsing</li>
                  <li>AI-generated cover letters based on job descriptions</li>
                  <li>Cloud storage of resume and application data</li>
                  <li>PDF generation and download functionality</li>
                  <li>User authentication and data management</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Shield className="mr-3 text-orange-500" size={24} />
                3. User Responsibilities
              </h2>
              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-2">You agree to:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>Provide accurate and truthful information in your resume</li>
                  <li>Use the service only for lawful job application purposes</li>
                  <li>Not share your account credentials with others</li>
                  <li>Not attempt to reverse engineer or exploit the service</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not upload malicious files or content</li>
                </ul>
                
                <h3 className="font-semibold text-gray-800 mb-2">You agree NOT to:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Use the service for generating false or misleading information</li>
                  <li>Attempt to overload or disrupt the service</li>
                  <li>Access other users' data or accounts</li>
                  <li>Use automated tools to scrape or abuse the service</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Content and Intellectual Property</h2>
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Your Content</h3>
                  <p className="text-gray-700">
                    You retain ownership of all content you upload (resumes, job descriptions). 
                    By using our service, you grant us a limited license to process this content 
                    for the purpose of providing our services.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Our Content</h3>
                  <p className="text-gray-700">
                    The service, including AI models, algorithms, and generated content, 
                    is owned by Craftly AI and protected by intellectual property laws.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="mr-3 text-red-500" size={24} />
                5. Disclaimers and Limitations
              </h2>
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">AI-Generated Content</h3>
                  <p className="text-gray-700">
                    AI-generated cover letters are suggestions only. You are responsible for 
                    reviewing, editing, and ensuring accuracy before use. We do not guarantee 
                    job application success.
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Service Availability</h3>
                  <p className="text-gray-700">
                    We strive for 99.9% uptime but cannot guarantee uninterrupted service. 
                    Maintenance, updates, or technical issues may cause temporary unavailability.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Limitation of Liability</h3>
                  <p className="text-gray-700">
                    Our liability is limited to the amount you paid for the service (if any) 
                    in the 12 months preceding the claim. We are not liable for indirect, 
                    consequential, or punitive damages.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Data and Privacy</h2>
              <div className="bg-indigo-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. Our data practices are governed by our 
                  Privacy Policy, which is incorporated into these terms by reference.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>We use Firebase for secure data storage</li>
                  <li>Data is encrypted in transit and at rest</li>
                  <li>You can delete your account and data at any time</li>
                  <li>We comply with GDPR and CCPA requirements</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Third-Party Services</h2>
              <div className="bg-yellow-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Our service integrates with third-party providers:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Google Services:</strong> Firebase, Analytics, OAuth, Gemini AI</li>
                  <li><strong>PDF Processing:</strong> PDF.js for document parsing</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  These services have their own terms and privacy policies. 
                  We are not responsible for their practices or availability.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Account Termination</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">By You</h3>
                  <p className="text-gray-700">
                    You may terminate your account at any time. Upon termination, 
                    your data will be deleted within 30 days.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">By Us</h3>
                  <p className="text-gray-700">
                    We may terminate accounts for violations of these terms, 
                    illegal activity, or abuse of the service. We will provide 
                    reasonable notice when possible.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Gavel className="mr-3 text-purple-500" size={24} />
                9. Legal and Governing Law
              </h2>
              <div className="bg-purple-50 rounded-lg p-6">
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Governing Law:</strong> These terms are governed by the laws of the jurisdiction where the service is operated</li>
                  <li><strong>Dispute Resolution:</strong> Disputes will be resolved through binding arbitration</li>
                  <li><strong>Severability:</strong> If any provision is found invalid, the remainder remains in effect</li>
                  <li><strong>Modifications:</strong> We may update these terms with 30 days notice</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Contact Information</h2>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For questions about these Terms of Service, contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> legal@gopichand.me</p>
                  <p><strong>Developer:</strong> Gopichand Busam</p>
                  <p><strong>Website:</strong> https://craftly.gopichand.me</p>
                  <p><strong>Response Time:</strong> Within 72 hours</p>
                </div>
              </div>
            </section>

            <div className="bg-gray-100 rounded-lg p-6 mt-8">
              <p className="text-sm text-gray-600 text-center">
                By continuing to use Craftly AI, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;