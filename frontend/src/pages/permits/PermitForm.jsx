import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { permitService, userService } from '../../services';

const PermitForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [picUsers, setPicUsers] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    visitPurpose: '',
    visitType: 'PREVENTIVE_MAINTENANCE',
    dataCenter: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    picId: '',
    equipmentList: '',
    workOrderDocument: '',
  });

  // Data center options based on backend enum
  const dataCenters = [
    { id: 'DC1', name: 'Data Center 1' },
    { id: 'DC2', name: 'Data Center 2' },
    { id: 'DC3', name: 'Data Center 3' },
  ];

  // Visit type options based on backend enum
  const visitTypes = [
    { id: 'PREVENTIVE_MAINTENANCE', name: 'Preventive Maintenance' },
    { id: 'ASSESSMENT', name: 'Assessment' },
    { id: 'TROUBLESHOOT', name: 'Troubleshoot' },
    { id: 'CABLE_PULLING', name: 'Cable Pulling' },
    { id: 'AUDIT', name: 'Audit' },
    { id: 'INSTALLATION', name: 'Installation' },
    { id: 'VISIT', name: 'Visit/Meeting' },
  ];

  useEffect(() => {
    loadPICUsers();
  }, []);

  const loadPICUsers = async () => {
    try {
      const users = await userService.getPICUsers();
      setPicUsers(users);
    } catch (err) {
      console.error('Error loading PIC users:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.visitPurpose.trim()) {
      setError('Work purpose is required');
      return false;
    }
    if (!formData.visitType) {
      setError('Visit type is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.dataCenter) {
      setError('Data center location is required');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Start and end times are required');
      return false;
    }
    if (!formData.picId) {
      setError('PIC selection is required');
      return false;
    }
    return true;
  };

  const handleNextStep = (nextStep) => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(nextStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare permit data for API
      const scheduledStartTime = `${formData.startDate}T${formData.startTime}:00`;
      const scheduledEndTime = `${formData.endDate}T${formData.endTime}:00`;

      const permitData = {
        visitPurpose: formData.visitPurpose,
        visitType: formData.visitType,
        dataCenter: formData.dataCenter,
        scheduledStartTime,
        scheduledEndTime,
        picId: parseInt(formData.picId),
        equipmentList: formData.equipmentList
          ? formData.equipmentList.split(',').map(item => item.trim())
          : [],
        // workOrderDocument is handled separately via upload
      };

      // 1. Create Permit
      const result = await permitService.create(permitData, user.userId);

      if (result.success && result.permitId) {
        // 2. Upload Document if exists
        if (formData.workOrderDocument && formData.workOrderDocument instanceof File) {
          try {
            await permitService.uploadDocument(result.permitId, formData.workOrderDocument);
          } catch (uploadErr) {
            console.error("File upload failed", uploadErr);
            alert("Permit created but DOCUMENT UPLOAD FAILED. Please try specific file upload again or contact support. Error: " + (uploadErr.response?.data?.message || uploadErr.message));
          }
        }

        navigate('/dashboard/permits');
      } else {
        setError(result.message || 'Failed to create permit');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating the permit');
    } finally {
      setIsLoading(false);
    }
  };

  const pics = picUsers.map(u => ({
    id: u.id.toString(),
    name: `${u.fullName} - ${u.company || 'DC Staff'}`
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-600">New Permit Request</h1>
        <p className="text-gray-500">Fill in the details to request a new working permit</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[
          { num: 1, label: 'Work Details' },
          { num: 2, label: 'Schedule & Location' },
          { num: 3, label: 'Documents' },
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s.num
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-500'
                }`}>
                {step > s.num ? <i className="ri-check-line"></i> : s.num}
              </div>
              <span className={`text-sm font-medium ${step >= s.num ? 'text-dark-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {/* Form */}
      <Card>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <i className="ri-error-warning-line text-red-500 text-xl"></i>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <Input
                label="Work Purpose"
                name="visitPurpose"
                placeholder="e.g., Server Maintenance, Network Inspection"
                value={formData.visitPurpose}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Visit Type</label>
                <select
                  name="visitType"
                  value={formData.visitType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {visitTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Equipment/Tools"
                name="equipmentList"
                placeholder="List any equipment you'll bring (comma separated)"
                value={formData.equipmentList}
                onChange={handleChange}
              />

              <div className="flex justify-end">
                <Button type="button" onClick={() => handleNextStep(2)}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Data Center Location</label>
                <select
                  name="dataCenter"
                  value={formData.dataCenter}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select location...</option>
                  {dataCenters.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                />
                <Input
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Tim Pendamping</label>
                <select
                  name="picId"
                  value={formData.picId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Pilih Tim Pendamping...</option>
                  {pics.map((pic) => (
                    <option key={pic.id} value={pic.id}>{pic.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Pilih PIC dari Tim ODC, Tim INFRA, atau Tim Network</p>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={() => handleNextStep(3)}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Upload Documents</label>

                {!formData.workOrderDocument ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-500 transition-colors bg-gray-50/50">
                    <input
                      type="file"
                      name="workOrderDocument"
                      onChange={handleChange}
                      className="hidden"
                      id="document-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer block w-full h-full">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                        <i className="ri-upload-cloud-line text-3xl text-primary-600"></i>
                      </div>
                      <p className="text-dark-600 font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400">PDF, DOC, or images up to 10MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <i className="ri-file-text-line text-primary-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-600 truncate max-w-50 sm:max-w-xs">
                          {formData.workOrderDocument.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.workOrderDocument.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, workOrderDocument: '' }))}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Upload: ID Card, Authorization Letter, Safety Certifications (if required)
                </p>
              </div>

              {/* Summary */}
              <Card className="bg-gray-50">
                <h3 className="font-bold text-dark-600 mb-4">Request Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Purpose:</span>
                    <span className="ml-2 font-medium text-dark-600">{formData.visitPurpose || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Visit Type:</span>
                    <span className="ml-2 font-medium text-dark-600">
                      {visitTypes.find(t => t.id === formData.visitType)?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-2 font-medium text-dark-600">
                      {dataCenters.find(l => l.id === formData.dataCenter)?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">PIC:</span>
                    <span className="ml-2 font-medium text-dark-600">
                      {pics.find(p => p.id === formData.picId)?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium text-dark-600">{formData.startDate || '-'} to {formData.endDate || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span>
                    <span className="ml-2 font-medium text-dark-600">{formData.startTime || '-'} - {formData.endTime || '-'}</span>
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" loading={isLoading} icon={<i className="ri-send-plane-line"></i>}>
                  Submit Request
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>
    </div>
  );
};

export default PermitForm;
