import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Camera, 
  Check, 
  Sparkles, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Link2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateProfile: (updatedData: Partial<User>) => Promise<void>;
}

const PRESET_AVATARS = [
  {
    label: 'Corporate Male',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Executive Female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Tech Professional',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Consultant',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Finance Leader',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    label: 'Healthcare Specialist',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
}) => {
  // Form state
  const [firstName, setFirstName] = useState(currentUser.first_name || '');
  const [lastName, setLastName] = useState(currentUser.last_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || currentUser.mobile || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser.date_of_birth || '1990-05-18');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(currentUser.gender || 'MALE');
  
  const [address, setAddress] = useState(currentUser.address || '');
  const [city, setCity] = useState(currentUser.city || 'Bengaluru');
  const [state, setState] = useState(currentUser.state || 'Karnataka');
  const [pincode, setPincode] = useState(currentUser.pincode || '560103');
  
  const [panNumber, setPanNumber] = useState(currentUser.pan_number || 'ABCDE1234F');
  const [nomineeName, setNomineeName] = useState(currentUser.nominee_name || 'Ananya Verma');
  const [nomineeRelation, setNomineeRelation] = useState(currentUser.nominee_relation || 'Spouse');

  // Profile Picture state
  const [profilePicture, setProfilePicture] = useState<string>(currentUser.profile_picture || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'avatar' | 'address'>('details');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever currentUser opens
  useEffect(() => {
    if (isOpen) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || currentUser.mobile || '');
      setDateOfBirth(currentUser.date_of_birth || '1990-05-18');
      setGender(currentUser.gender || 'MALE');
      setAddress(currentUser.address || 'Flat 402, Green Glen Heights, Bellandur');
      setCity(currentUser.city || 'Bengaluru');
      setState(currentUser.state || 'Karnataka');
      setPincode(currentUser.pincode || '560103');
      setPanNumber(currentUser.pan_number || 'ABCDE1234F');
      setNomineeName(currentUser.nominee_name || 'Ananya Verma');
      setNomineeRelation(currentUser.nominee_relation || 'Spouse');
      setProfilePicture(currentUser.profile_picture || '');
      setCustomUrlInput('');
      setErrorMessage('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle local image file upload & convert to base64 Data URL
  const handleFileChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please select an image under 5MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setProfilePicture(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    setProfilePicture(url);
    setCustomUrlInput('');
  };

  const handleRemovePicture = () => {
    setProfilePicture('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim()) {
      setErrorMessage('First name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Contact phone number is required.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        mobile: phone.trim(),
        date_of_birth: dateOfBirth,
        gender,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        pan_number: panNumber.trim().toUpperCase(),
        nominee_name: nomineeName.trim(),
        nominee_relation: nomineeRelation.trim(),
        profile_picture: profilePicture || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update profile details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-black tracking-tight">
                Edit Customer Profile
              </h2>
              <p className="text-xs text-slate-300">
                Update your personal information, KYC contacts, and profile photo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'avatar'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Picture & Avatar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative ${
              activeTab === 'address'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Address & Nominee KYC
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Personal Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Mini Profile Header Preview */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/70 flex items-center gap-4">
                <div className="relative shrink-0">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shadow-emerald-500/20 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-2xl border-2 border-emerald-400 shadow-md">
                      {firstName ? firstName[0].toUpperCase() : 'C'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('avatar')}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors"
                    title="Change Photo"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wide">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Policyholder</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                    {firstName || 'First'} {lastName || 'Last'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {email || 'user@example.com'} • {phone || '+91 98765 43210'}
                  </p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Amit"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Verma"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* DOB and Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                          gender === g
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Profile Picture & Avatar */}
          {activeTab === 'avatar' && (
            <div className="space-y-6">
              {/* Picture preview & Quick Action Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl text-white flex flex-col sm:flex-row items-center gap-5 border border-white/10 shadow-lg">
                <div className="relative">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-emerald-400 shadow-xl shadow-emerald-500/25 bg-slate-800"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white flex items-center justify-center font-black text-3xl border-4 border-emerald-400 shadow-xl">
                      {firstName ? firstName[0].toUpperCase() : 'C'}
                    </div>
                  )}
                  {profilePicture && (
                    <button
                      type="button"
                      onClick={handleRemovePicture}
                      title="Remove Profile Picture"
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-colors border-2 border-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                    {profilePicture ? 'Custom Photo Active' : 'Default Monogram Avatar'}
                  </span>
                  <h4 className="text-lg font-black mt-1">
                    {firstName || 'Customer'} {lastName || 'Profile'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">
                    This photo appears on your official insurance certificates, policy cards, and portal sidebar.
                  </p>
                </div>
              </div>

              {/* Upload Local Image Box (with Drag & Drop) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Upload New Photo
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver 
                      ? 'border-blue-600 bg-blue-50/50 scale-[1.01]' 
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag & drop photo here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, WEBP, or GIF (up to 5MB)
                  </p>
                </div>
              </div>

              {/* Curated Preset Avatars */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Or Select from Curated Member Avatars</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((preset, idx) => {
                    const isSelected = profilePicture === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfilePicture(preset.url)}
                        className={`relative rounded-2xl overflow-hidden border-2 transition-all group aspect-square p-0.5 ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-400/40 shadow-md'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                        title={preset.label}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-emerald-600/30 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paste Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Or Provide Custom Web Image Link
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    Set URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Address & Nominee KYC */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Residential Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Green Glen Heights, Bellandur Ring Road"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560103"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* KYC & Nominee */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Underwriting KYC & Default Nominee
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      PAN / Tax ID
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 uppercase focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nominee Name
                    </label>
                    <input
                      type="text"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      placeholder="e.g. Ananya Verma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Relationship
                    </label>
                    <select
                      value={nomineeRelation}
                      onChange={(e) => setNomineeRelation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Legal Heir">Legal Heir</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'details' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
                >
                  Back to Details
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
