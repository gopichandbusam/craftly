import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, ExternalLink, 
  ChevronDown, ChevronUp, Briefcase, 
  GraduationCap, Award, FileText, 
  CheckCircle, AlertTriangle, Info, Edit3, Save, X
} from 'lucide-react';
import { ResumeData } from '../types';
import { trackResumeEdit, trackFeatureUsage } from '../services/analytics';
import { updateResumeInFirebase } from '../services/firebaseStorage';

interface ResumePreviewProps {
  resumeData: ResumeData;
  onResumeUpdate: (updatedData: ResumeData) => void;
  onContinue: () => void;
  validationResult?: any;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, onResumeUpdate, onContinue, validationResult }) => {
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [experienceExpanded, setExperienceExpanded] = useState(false);
  const [educationExpanded, setEducationExpanded] = useState(false);
  
  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  
  // Temporary edit data
  const [editData, setEditData] = useState<ResumeData>(resumeData);
  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isDefaultValue = (field: string, value: string): boolean => {
    const defaults: Record<string, string> = {
      name: 'Professional',
      email: 'contact@email.com',
      phone: '+1 (555) 000-0000',
      location: 'Location Not Specified',
      linkedin: 'profile'
    };
    return defaults[field] === value;
  };

  const categorizeSkills = (skills: string[]) => {
    const categories = {
      technical: [] as string[],
      programming: [] as string[],
      tools: [] as string[],
      soft: [] as string[],
      other: [] as string[]
    };

    const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 'typescript', 'angular', 'vue'];
    const programmingKeywords = ['c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab'];
    const toolKeywords = ['git', 'jira', 'figma', 'photoshop', 'jenkins', 'terraform', 'slack', 'confluence', 'trello'];
    const softKeywords = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative', 'management'];

    skills.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (techKeywords.some(keyword => lowerSkill.includes(keyword))) {
        categories.technical.push(skill);
      } else if (programmingKeywords.some(keyword => lowerSkill.includes(keyword))) {
        categories.programming.push(skill);
      } else if (toolKeywords.some(keyword => lowerSkill.includes(keyword))) {
        categories.tools.push(skill);
      } else if (softKeywords.some(keyword => lowerSkill.includes(keyword))) {
        categories.soft.push(skill);
      } else {
        categories.other.push(skill);
      }
    });

    return categories;
  };

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      const updatedData = { ...resumeData, ...editData };
      
      // Determine if this is a major change that should update user timestamp
      const isMajorChange = resumeData.name !== editData.name || resumeData.email !== editData.email;
      
      // Update in Firebase with appropriate timestamp handling
      await updateResumeInFirebase(updatedData, isMajorChange);
      
      onResumeUpdate(updatedData);
      setIsEditingPersonal(false);
      trackResumeEdit('personal', 'edit');
      
      console.log(isMajorChange ? '✅ Major change: User timestamp updated' : '✅ Minor change: Only resume data updated');
    } catch (error) {
      console.error('❌ Error saving personal data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPersonal = () => {
    setEditData(resumeData);
    setIsEditingPersonal(false);
  };

  const handleSaveSkills = async () => {
    setIsSaving(true);
    try {
      const updatedData = { ...resumeData, skills: editData.skills };
      
      // Skills changes are typically minor updates
      await updateResumeInFirebase(updatedData, false);
      
      onResumeUpdate(updatedData);
      setIsEditingSkills(false);
      setNewSkill('');
      trackResumeEdit('skills', 'edit');
      
      console.log('✅ Skills updated: Resume data only (no user timestamp change)');
    } catch (error) {
      console.error('❌ Error saving skills:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditData({
        ...editData,
        skills: [...editData.skills, newSkill.trim()]
      });
      setNewSkill('');
      trackResumeEdit('skills', 'add');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setEditData({
      ...editData,
      skills: editData.skills.filter((_, i) => i !== index)
    });
    trackResumeEdit('skills', 'remove');
  };

  const handleSaveExperience = async () => {
    setIsSaving(true);
    try {
      const updatedData = { ...resumeData, experience: editData.experience };
      
      // Experience changes are typically minor updates
      await updateResumeInFirebase(updatedData, false);
      
      onResumeUpdate(updatedData);
      setIsEditingExperience(false);
      setNewExperience('');
      trackResumeEdit('experience', 'edit');
      
      console.log('✅ Experience updated: Resume data only (no user timestamp change)');
    } catch (error) {
      console.error('❌ Error saving experience:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExperience = () => {
    if (newExperience.trim()) {
      setEditData({
        ...editData,
        experience: [...editData.experience, newExperience.trim()]
      });
      setNewExperience('');
      trackResumeEdit('experience', 'add');
    }
  };

  const handleRemoveExperience = (index: number) => {
    setEditData({
      ...editData,
      experience: editData.experience.filter((_, i) => i !== index)
    });
    trackResumeEdit('experience', 'remove');
  };

  const handleSaveEducation = async () => {
    setIsSaving(true);
    try {
      const updatedData = { ...resumeData, education: editData.education };
      
      // Education changes are typically minor updates
      await updateResumeInFirebase(updatedData, false);
      
      onResumeUpdate(updatedData);
      setIsEditingEducation(false);
      setNewEducation('');
      trackResumeEdit('education', 'edit');
      
      console.log('✅ Education updated: Resume data only (no user timestamp change)');
    } catch (error) {
      console.error('❌ Error saving education:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = () => {
    if (newEducation.trim()) {
      setEditData({
        ...editData,
        education: [...editData.education, newEducation.trim()]
      });
      setNewEducation('');
      trackResumeEdit('education', 'add');
    }
  };

  const handleRemoveEducation = (index: number) => {
    setEditData({
      ...editData,
      education: editData.education.filter((_, i) => i !== index)
    });
    trackResumeEdit('education', 'remove');
  };

  const skillCategories = categorizeSkills(resumeData.skills);
  const hasValidData = !isDefaultValue('name', resumeData.name) || 
                      !isDefaultValue('email', resumeData.email) ||
                      resumeData.skills.length > 1 ||
                      resumeData.experience.length > 1 ||
                      resumeData.education.length > 1;

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={16} />;
    if (score >= 60) return <AlertTriangle size={16} />;
    return <Info size={16} />;
  };

  return (
    <div className="bg-gray-50/50 rounded-2xl p-6 max-h-[800px] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">AI-Extracted Resume Data</h3>
        <div className="flex items-center space-x-2">
          {hasValidData && (
            <div className="flex items-center text-green-600 text-sm">
              <Award size={16} className="mr-1" />
              <span>Successfully Parsed</span>
            </div>
          )}
          {validationResult && (
            <div className={`flex items-center text-sm px-3 py-1 rounded-full border ${getQualityColor(validationResult.score)}`}>
              {getQualityIcon(validationResult.score)}
              <span className="ml-1">Quality: {validationResult.score}/100</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User size={20} className="text-blue-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
          </div>
          <button
            onClick={() => {
              if (isEditingPersonal) {
                handleCancelPersonal();
              } else {
                setEditData(resumeData);
                setIsEditingPersonal(true);
                trackFeatureUsage('edit_personal_info');
              }
            }}
            disabled={isSaving}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 disabled:opacity-50"
          >
            {isEditingPersonal ? <X size={16} /> : <Edit3 size={16} />}
          </button>
        </div>
        
        {isEditingPersonal ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Username</label>
              <input
                type="text"
                value={editData.linkedin}
                onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                placeholder="e.g., johndoe"
                disabled={isSaving}
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSavePersonal}
                disabled={isSaving}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-1" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancelPersonal}
                disabled={isSaving}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
              💡 Name and email changes update your profile timestamp. Other changes only update resume data.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <User size={16} className="text-gray-400 mr-2" />
                <span className="font-medium text-gray-700 mr-2">Name:</span>
                <span className={`${isDefaultValue('name', resumeData.name) ? 'text-orange-600' : 'text-gray-900'}`}>
                  {resumeData.name}
                </span>
                {isDefaultValue('name', resumeData.name) && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Default</span>
                )}
              </div>
              
              <div className="flex items-center">
                <Mail size={16} className="text-gray-400 mr-2" />
                <span className="font-medium text-gray-700 mr-2">Email:</span>
                <a 
                  href={`mailto:${resumeData.email}`} 
                  className={`hover:underline ${isDefaultValue('email', resumeData.email) ? 'text-orange-600' : 'text-blue-600'}`}
                >
                  {resumeData.email}
                </a>
                {isDefaultValue('email', resumeData.email) && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Default</span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone size={16} className="text-gray-400 mr-2" />
                <span className="font-medium text-gray-700 mr-2">Phone:</span>
                <span className={`${isDefaultValue('phone', resumeData.phone) ? 'text-orange-600' : 'text-gray-900'}`}>
                  {resumeData.phone}
                </span>
                {isDefaultValue('phone', resumeData.phone) && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Default</span>
                )}
              </div>
              
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <span className="font-medium text-gray-700 mr-2">Location:</span>
                <span className={`${isDefaultValue('location', resumeData.location) ? 'text-orange-600' : 'text-gray-900'}`}>
                  {resumeData.location}
                </span>
                {isDefaultValue('location', resumeData.location) && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Default</span>
                )}
              </div>
            </div>
            
            <div className="col-span-full mt-3 flex items-center">
              <ExternalLink size={16} className="text-gray-400 mr-2" />
              <span className="font-medium text-gray-700 mr-2">LinkedIn:</span>
              <a 
                href={`https://linkedin.com/in/${resumeData.linkedin}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`hover:underline inline-flex items-center ${isDefaultValue('linkedin', resumeData.linkedin) ? 'text-orange-600' : 'text-blue-600'}`}
              >
                linkedin.com/in/{resumeData.linkedin}
                <ExternalLink size={12} className="ml-1" />
              </a>
              {isDefaultValue('linkedin', resumeData.linkedin) && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Default</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award size={20} className="text-purple-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800">
              Skills ({resumeData.skills.length})
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isEditingSkills) {
                  setEditData(resumeData);
                  setIsEditingSkills(false);
                  setNewSkill('');
                } else {
                  setEditData(resumeData);
                  setIsEditingSkills(true);
                  trackFeatureUsage('edit_skills');
                }
              }}
              disabled={isSaving}
              className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50 disabled:opacity-50"
            >
              {isEditingSkills ? <X size={16} /> : <Edit3 size={16} />}
            </button>
            {resumeData.skills.length > 8 && (
              <button
                onClick={() => {
                  setSkillsExpanded(!skillsExpanded);
                  trackFeatureUsage('expand_skills', { expanded: !skillsExpanded });
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                {skillsExpanded ? (
                  <>
                    <span className="mr-1">Collapse</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span className="mr-1">Expand</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {isEditingSkills ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {editData.skills.map((skill, index) => (
                <div key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full flex items-center">
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(index)}
                    disabled={isSaving}
                    className="ml-2 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                disabled={isSaving}
              />
              <button
                onClick={handleAddSkill}
                disabled={isSaving}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveSkills}
                disabled={isSaving}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-1" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditData(resumeData);
                  setIsEditingSkills(false);
                  setNewSkill('');
                }}
                disabled={isSaving}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          resumeData.skills.length > 0 ? (
            <div className="space-y-4">
              {!skillsExpanded ? (
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.slice(0, 8).map((skill, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {resumeData.skills.length > 8 && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      +{resumeData.skills.length - 8} more
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(skillCategories).map(([category, skills]) => 
                    skills.length > 0 && (
                      <div key={category}>
                        <h5 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                          {category} Skills ({skills.length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              <Award size={24} className="mx-auto mb-2 opacity-50" />
              <p>No skills entries found</p>
            </div>
          )
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Briefcase size={20} className="text-green-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800">
              Experience ({resumeData.experience.length})
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isEditingExperience) {
                  setEditData(resumeData);
                  setIsEditingExperience(false);
                  setNewExperience('');
                } else {
                  setEditData(resumeData);
                  setIsEditingExperience(true);
                  trackFeatureUsage('edit_experience');
                }
              }}
              disabled={isSaving}
              className="p-2 text-gray-500 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              {isEditingExperience ? <X size={16} /> : <Edit3 size={16} />}
            </button>
            {resumeData.experience.length > 2 && (
              <button
                onClick={() => {
                  setExperienceExpanded(!experienceExpanded);
                  trackFeatureUsage('expand_experience', { expanded: !experienceExpanded });
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                {experienceExpanded ? (
                  <>
                    <span className="mr-1">Collapse</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span className="mr-1">Show All</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {isEditingExperience ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {editData.experience.map((exp, index) => (
                <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 relative">
                  <textarea
                    value={exp}
                    onChange={(e) => {
                      const updatedExperience = [...editData.experience];
                      updatedExperience[index] = e.target.value;
                      setEditData({ ...editData, experience: updatedExperience });
                    }}
                    className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 leading-relaxed pr-8"
                    rows={3}
                    disabled={isSaving}
                  />
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    disabled={isSaving}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <textarea
                value={newExperience}
                onChange={(e) => setNewExperience(e.target.value)}
                placeholder="Add new experience entry..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-transparent resize-none"
                rows={3}
                disabled={isSaving}
              />
              <button
                onClick={handleAddExperience}
                disabled={isSaving}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Add Experience
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveExperience}
                disabled={isSaving}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-1" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditData(resumeData);
                  setIsEditingExperience(false);
                  setNewExperience('');
                }}
                disabled={isSaving}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          resumeData.experience.length > 0 && 
          !(resumeData.experience.length === 1 && resumeData.experience[0].includes('Professional Experience')) ? (
            <div className="space-y-3">
              {(experienceExpanded ? resumeData.experience : resumeData.experience.slice(0, 2)).map((exp, index) => (
                <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm text-gray-700 leading-relaxed">{exp}</p>
                </div>
              ))}
              {!experienceExpanded && resumeData.experience.length > 2 && (
                <div className="text-center">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    +{resumeData.experience.length - 2} more entries
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              <Briefcase size={24} className="mx-auto mb-2 opacity-50" />
              <p>No experience entries found</p>
            </div>
          )
        )}
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <GraduationCap size={20} className="text-blue-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800">
              Education ({resumeData.education.length})
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (isEditingEducation) {
                  setEditData(resumeData);
                  setIsEditingEducation(false);
                  setNewEducation('');
                } else {
                  setEditData(resumeData);
                  setIsEditingEducation(true);
                  trackFeatureUsage('edit_education');
                }
              }}
              disabled={isSaving}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              {isEditingEducation ? <X size={16} /> : <Edit3 size={16} />}
            </button>
            {resumeData.education.length > 2 && (
              <button
                onClick={() => {
                  setEducationExpanded(!educationExpanded);
                  trackFeatureUsage('expand_education', { expanded: !educationExpanded });
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                {educationExpanded ? (
                  <>
                    <span className="mr-1">Collapse</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span className="mr-1">Show All</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {isEditingEducation ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {editData.education.map((edu, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 relative">
                  <textarea
                    value={edu}
                    onChange={(e) => {
                      const updatedEducation = [...editData.education];
                      updatedEducation[index] = e.target.value;
                      setEditData({ ...editData, education: updatedEducation });
                    }}
                    className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 leading-relaxed pr-8"
                    rows={2}
                    disabled={isSaving}
                  />
                  <button
                    onClick={() => handleRemoveEducation(index)}
                    disabled={isSaving}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <textarea
                value={newEducation}
                onChange={(e) => setNewEducation(e.target.value)}
                placeholder="Add new education entry..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
                rows={2}
                disabled={isSaving}
              />
              <button
                onClick={handleAddEducation}
                disabled={isSaving}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                Add Education
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEducation}
                disabled={isSaving}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-1" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditData(resumeData);
                  setIsEditingEducation(false);
                  setNewEducation('');
                }}
                disabled={isSaving}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          resumeData.education.length > 0 && 
          !(resumeData.education.length === 1 && resumeData.education[0].includes('Educational Background')) ? (
            <div className="space-y-3">
              {(educationExpanded ? resumeData.education : resumeData.education.slice(0, 2)).map((edu, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-gray-700 leading-relaxed">{edu}</p>
                </div>
              ))}
              {!educationExpanded && resumeData.education.length > 2 && (
                <div className="text-center">
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    +{resumeData.education.length - 2} more entries
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              <GraduationCap size={24} className="mx-auto mb-2 opacity-50" />
              <p>No education entries found</p>
            </div>
          )
        )}
      </div>

      {/* Professional Summary */}
      {resumeData.summary && resumeData.summary !== 'Experienced professional with a proven track record of success.' && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center mb-4">
            <FileText size={20} className="text-indigo-500 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800">Professional Summary</h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      {/* Data Quality Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-semibold text-gray-800">Data Extraction Quality</h5>
          {validationResult && (
            <div className={`px-3 py-1 rounded-full text-sm ${getQualityColor(validationResult.score)}`}>
              {validationResult.score}/100
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${!isDefaultValue('name', resumeData.name) ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span>Name: {!isDefaultValue('name', resumeData.name) ? 'Extracted' : 'Default'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${!isDefaultValue('email', resumeData.email) ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span>Email: {!isDefaultValue('email', resumeData.email) ? 'Extracted' : 'Default'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${!isDefaultValue('phone', resumeData.phone) ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span>Phone: {!isDefaultValue('phone', resumeData.phone) ? 'Extracted' : 'Default'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${resumeData.skills.length > 1 ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span>Skills: {resumeData.skills.length} found</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${resumeData.experience.length > 1 ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span>Experience: {resumeData.experience.length} entries</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${resumeData.education.length > 1 ? 'bg-green-400' : 'bg-orange-400'}`}></div>
              <span>Education: {resumeData.education.length} entries</span>
            </div>
          </div>
        </div>
        
        {validationResult && validationResult.suggestions.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Suggestions for better results:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              {validationResult.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={() => {
          trackFeatureUsage('continue_to_cover_letter', {
            validation_score: validationResult?.score || 0,
            skills_count: resumeData.skills.length,
            experience_count: resumeData.experience.length
          });
          onContinue();
        }}
        className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white py-4 rounded-2xl font-semibold hover:from-blue-500 hover:to-purple-500 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
      >
        Continue to Cover Letter Generator
      </button>
    </div>
  );
};

export default ResumePreview;