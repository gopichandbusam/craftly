import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit3, User, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { ResumeData } from '../types';
import { updateResumeInSupabase } from '../services/supabaseStorage';
import { trackUserAction } from '../services/optimizedAnalytics';

interface EditResumeDataProps {
  resumeData: ResumeData | null;
  onResumeUpdate: (data: ResumeData) => void;
}

const EditResumeData: React.FC<EditResumeDataProps> = ({ resumeData, onResumeUpdate }) => {
  const [formData, setFormData] = useState<ResumeData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    skills: [],
    experience: [],
    education: [],
    summary: ''
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resumeData) {
      setFormData(resumeData);
    }
  }, [resumeData]);

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    if (newExperience.trim()) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience.trim()]
      }));
      setNewExperience('');
    }
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    if (newEducation.trim()) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, newEducation.trim()]
      }));
      setNewEducation('');
    }
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateResumeInSupabase(formData);
      onResumeUpdate(formData);
      trackUserAction('resume_edited');
      alert('Resume updated successfully in Supabase!');
    } catch (error) {
      console.error('Failed to save resume:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!resumeData) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">No Resume Data</h1>
          <p className="text-gray-600 text-lg">Please upload a resume first to edit the data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Resume Data</h1>
            <p className="text-gray-600 text-lg">Refine your information for better cover letters</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-500 hover:to-blue-500 transition-all duration-200 flex items-center disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {isSaving ? 'Saving to Supabase...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <User className="text-blue-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Linkedin size={16} className="inline mr-2" />
                  LinkedIn Username
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="username (without linkedin.com/in/)"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <Edit3 className="text-purple-500 mr-3" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Professional Summary</h2>
            </div>
            
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Write a brief professional summary..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          {/* Skills */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills</h2>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={addSkill}
                  className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center">
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Work Experience</h2>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <textarea
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  placeholder="Add work experience (Job Title at Company - Description)..."
                  rows={2}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
                <button
                  onClick={addExperience}
                  className="bg-purple-500 text-white px-4 py-3 rounded-xl hover:bg-purple-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.experience.map((exp, index) => (
                <div key={index} className="bg-purple-50 rounded-xl p-4 flex items-start justify-between">
                  <p className="text-gray-700 flex-1">{exp}</p>
                  <button
                    onClick={() => removeExperience(index)}
                    className="ml-3 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Education</h2>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <textarea
                  value={newEducation}
                  onChange={(e) => setNewEducation(e.target.value)}
                  placeholder="Add education (Degree from Institution - Year)..."
                  rows={2}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
                <button
                  onClick={addEducation}
                  className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.education.map((edu, index) => (
                <div key={index} className="bg-green-50 rounded-xl p-4 flex items-start justify-between">
                  <p className="text-gray-700 flex-1">{edu}</p>
                  <button
                    onClick={() => removeEducation(index)}
                    className="ml-3 text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditResumeData;