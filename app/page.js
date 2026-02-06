'use client';

import { useState } from 'react';

export default function ConstitucionSAS() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Estados para tracking
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  
  // ⚠️ REEMPLAZA ESTA URL CON LA TUYA DE GOOGLE APPS SCRIPT
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkoHMBlomaB3DJ_kGuGxjUXmqTavXie5YKHeQUoqQo1XDckNo5wBS6SNCKOk79BU3C/exec';
  
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    objetoSocial: '',
    ciudadSociedad: 'Bogotá D.C.',
    direccionSociedad: '',
    telefonoSociedad: '',
    emailSociedad: '',
    capitalPreset: 'startup',
    capitalAutorizado: '100000000',
    capitalSuscrito: '1000000',
    capitalPagado: '1000000',
    accionistas: [{
      id: 1,
      // V4: Nuevo campo tipo persona
      tipoPersona: 'natural',
      // Campos persona natural
      nombres: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      lugarExpedicion: '',
      nacionalidad: 'Colombiana',
      // Campos persona jurídica
      razonSocial: '',
      nit: '',
      repLegalNombres: '',
      repLegalCedula: '',
      // Campos comunes
      ciudadDomicilio: '',
      direccionResidencia: '',
      email: '',
      telefono: '',
      porcentaje: 100,
      esGerente: true,
      documentoFile: null,
      documentoFileName: '',
      documentoBase64: '',
    }],
    gerenteSuplente: {
      tiene: false,
      nombres: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      lugarExpedicion: '',
    },
    aceptaPolitica: false,
  });

  const tieneExtranjeros = formData.accionistas.some(a => 
    a.tipoPersona === 'natural' && a.nacionalidad.toLowerCase() !== 'colombiana' && a.nacionalidad !== ''
  );

  const totalPorcentaje = formData.accionistas.reduce((sum, a) => sum + (parseFloat(a.porcentaje) || 0), 0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAccionistaChange = (index, field, value) => {
    setFormData(prev => {
      const newAccionistas = [...prev.accionistas];
      newAccionistas[index] = { ...newAccionistas[index], [field]: value };
      if (field === 'esGerente' && value === true) {
        newAccionistas.forEach((acc, i) => {
          if (i !== index) acc.esGerente = false;
        });
      }
      return { ...prev, accionistas: newAccionistas };
    });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 10MB.');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato no válido. Usa PDF, JPG o PNG.');
      return;
    }
    
    setUploadProgress(prev => ({ ...prev, [index]: 'loading' }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      handleAccionistaChange(index, 'documentoFile', file);
      handleAccionistaChange(index, 'documentoFileName', file.name);
      handleAccionistaChange(index, 'documentoBase64', base64);
      setUploadProgress(prev => ({ ...prev, [index]: 'done' }));
    };
    reader.onerror = () => {
      alert('Error al leer el archivo');
      setUploadProgress(prev => ({ ...prev, [index]: 'error' }));
    };
    reader.readAsDataURL(file);
  };

  const addAccionista = () => {
    const restante = Math.max(0, 100 - totalPorcentaje);
    setFormData(prev => ({
      ...prev,
      accionistas: [...prev.accionistas, {
        id: Date.now(),
        tipoPersona: 'natural',
        nombres: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        lugarExpedicion: '',
        nacionalidad: 'Colombiana',
        razonSocial: '',
        nit: '',
        repLegalNombres: '',
        repLegalCedula: '',
        ciudadDomicilio: '',
        direccionResidencia: '',
        email: '',
        telefono: '',
        porcentaje: restante,
        esGerente: false,
        documentoFile: null,
        documentoFileName: '',
        documentoBase64: '',
      }]
    }));
  };

  const removeAccionista = (index) => {
    if (formData.accionistas.length > 1) {
      setFormData(prev => {
        const newAccionistas = prev.accionistas.filter((_, i) => i !== index);
        if (!newAccionistas.some(a => a.esGerente)) {
          newAccionistas[0].esGerente = true;
        }
        return { ...prev, accionistas: newAccionistas };
      });
    }
  };

  const handleCapitalPreset = (preset) => {
    const presets = {
      startup: { autorizado: '100000000', suscrito: '1000000', pagado: '1000000' },
      pyme: { autorizado: '500000000', suscrito: '50000000', pagado: '50000000' },
      grande: { autorizado: '1000000000', suscrito: '100000000', pagado: '100000000' },
      personalizado: { autorizado: formData.capitalAutorizado, suscrito: formData.capitalSuscrito, pagado: formData.capitalPagado }
    };
    
    setFormData(prev => ({
      ...prev,
      capitalPreset: preset,
      capitalAutorizado: presets[preset].autorizado,
      capitalSuscrito: presets[preset].suscrito,
      capitalPagado: presets[preset].pagado,
    }));
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.nombreEmpresa.trim()) {
          alert('Ingresa el nombre de la empresa');
          return false;
        }
        if (!formData.objetoSocial.trim()) {
          alert('Describe el objeto social / actividad económica');
          return false;
        }
        if (!formData.ciudadSociedad.trim()) {
          alert('Ingresa la ciudad de la sociedad');
          return false;
        }
        return true;
      case 2:
        for (let i = 0; i < formData.accionistas.length; i++) {
          const acc = formData.accionistas[i];
          
          if (acc.tipoPersona === 'natural') {
            if (!acc.nombres.trim()) {
              alert(`Ingresa los nombres del accionista ${i + 1}`);
              return false;
            }
            if (!acc.numeroDocumento.trim()) {
              alert(`Ingresa el número de documento del accionista ${i + 1}`);
              return false;
            }
          } else {
            // Persona jurídica
            if (!acc.razonSocial.trim()) {
              alert(`Ingresa la razón social del accionista ${i + 1}`);
              return false;
            }
            if (!acc.nit.trim()) {
              alert(`Ingresa el NIT del accionista ${i + 1}`);
              return false;
            }
            if (!acc.repLegalNombres.trim()) {
              alert(`Ingresa el nombre del representante legal del accionista ${i + 1}`);
              return false;
            }
            if (!acc.repLegalCedula.trim()) {
              alert(`Ingresa la cédula del representante legal del accionista ${i + 1}`);
              return false;
            }
          }
          
          if (!acc.email.trim()) {
            alert(`Ingresa el email del accionista ${i + 1}`);
            return false;
          }
        }
        if (Math.abs(totalPorcentaje - 100) > 0.01) {
          alert(`Los porcentajes deben sumar 100%. Actualmente suman ${totalPorcentaje}%`);
          return false;
        }
        return true;
      case 3:
        if (!formData.aceptaPolitica) {
          alert('Debes aceptar la política de tratamiento de datos');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DL-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    const newTrackingCode = generateTrackingCode();
    
    try {
      const payload = {
        trackingCode: newTrackingCode,
        empresa: {
          nombre: formData.nombreEmpresa.toUpperCase(),
          objetoSocial: formData.objetoSocial,
          ciudad: formData.ciudadSociedad,
          direccion: formData.direccionSociedad,
          telefono: formData.telefonoSociedad,
          email: formData.emailSociedad,
        },
        capital: {
          autorizado: formData.capitalAutorizado,
          suscrito: formData.capitalSuscrito,
          pagado: formData.capitalPagado,
          valorAccion: '1000',
        },
        accionistas: formData.accionistas.map(acc => ({
          tipoPersona: acc.tipoPersona,
          // Campos persona natural
          nombres: acc.nombres.toUpperCase(),
          tipoDocumento: acc.tipoDocumento,
          numeroDocumento: acc.numeroDocumento,
          lugarExpedicion: acc.lugarExpedicion,
          nacionalidad: acc.nacionalidad,
          // Campos persona jurídica
          razonSocial: acc.razonSocial?.toUpperCase() || '',
          nit: acc.nit || '',
          repLegalNombres: acc.repLegalNombres?.toUpperCase() || '',
          repLegalCedula: acc.repLegalCedula || '',
          // Campos comunes
          ciudadDomicilio: acc.ciudadDomicilio,
          direccionResidencia: acc.direccionResidencia,
          email: acc.email,
          telefono: acc.telefono,
          porcentaje: parseFloat(acc.porcentaje),
          esGerente: acc.esGerente,
          documentoFileName: acc.documentoFileName,
          documentoBase64: acc.documentoBase64,
        })),
        gerenteSuplente: formData.gerenteSuplente,
        tieneExtranjeros: tieneExtranjeros,
      };
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      setTrackingCode(newTrackingCode);
      setCurrentStep(4);
      
    } catch (error) {
      console.error('Error:', error);
      setTrackingCode(newTrackingCode);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    const codigo = e.target.codigo.value.trim().toUpperCase();
    
    if (!codigo) {
      setTrackingError('Ingresa un código de seguimiento');
      return;
    }
    
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingData(null);
    
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?codigo=${codigo}`);
      const data = await response.json();
      
      if (data.success) {
        setTrackingData(data.data);
      } else {
        setTrackingError(data.error || 'No se encontró el código');
      }
    } catch (error) {
      setTrackingError('Error al consultar. Intenta de nuevo.');
    } finally {
      setTrackingLoading(false);
    }
  };

  const formatCurrency = (num) => {
    return '$' + parseInt(num || 0).toLocaleString('es-CO');
  };

  // ============================================================================
  // ESTILOS MEJORADOS V4
  // ============================================================================
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fc 0%, #e8ecf4 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    header: {
      background: 'linear-gradient(135deg, #232C54 0%, #1a2140 100%)',
      padding: '20px 24px',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(35, 44, 84, 0.3)',
    },
    logo: {
      fontSize: 'clamp(20px, 4vw, 26px)',
      fontWeight: '700',
      letterSpacing: '-0.5px',
    },
    backBtn: {
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      backdropFilter: 'blur(10px)',
    },
    // ============================================================================
    // HERO MEJORADO
    // ============================================================================
    heroSection: {
      background: 'linear-gradient(135deg, #232C54 0%, #1a2140 50%, #0f1629 100%)',
      padding: 'clamp(60px, 10vw, 100px) 24px',
      textAlign: 'center',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    },
    heroPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.5,
    },
    heroContent: {
      position: 'relative',
      zIndex: 1,
      maxWidth: '800px',
      margin: '0 auto',
    },
    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(216, 90, 45, 0.2)',
      border: '1px solid rgba(216, 90, 45, 0.4)',
      padding: '8px 16px',
      borderRadius: '50px',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '24px',
      color: '#FFB088',
    },
    heroTitle: {
      fontSize: 'clamp(32px, 6vw, 52px)',
      fontWeight: '800',
      lineHeight: '1.15',
      marginBottom: '20px',
      letterSpacing: '-1px',
    },
    heroHighlight: {
      background: 'linear-gradient(90deg, #D85A2D, #FF8C5A)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSubtitle: {
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      opacity: 0.85,
      maxWidth: '600px',
      margin: '0 auto 40px',
      lineHeight: '1.6',
    },
    heroCTA: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center',
    },
    primaryBtn: {
      background: 'linear-gradient(135deg, #D85A2D 0%, #e86a3d 100%)',
      color: '#fff',
      border: 'none',
      padding: '18px 48px',
      fontSize: '18px',
      fontWeight: '600',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 20px rgba(216, 90, 45, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    secondaryBtn: {
      background: 'transparent',
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.3)',
      padding: '16px 40px',
      fontSize: '16px',
      fontWeight: '500',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    // ============================================================================
    // SECCIÓN DE FEATURES
    // ============================================================================
    featuresSection: {
      padding: '80px 24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      textAlign: 'center',
      fontSize: 'clamp(24px, 4vw, 36px)',
      fontWeight: '700',
      color: '#232C54',
      marginBottom: '16px',
    },
    sectionSubtitle: {
      textAlign: 'center',
      color: '#666',
      fontSize: '18px',
      marginBottom: '48px',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
    },
    featureCard: {
      background: '#fff',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      border: '1px solid rgba(0,0,0,0.05)',
    },
    featureIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      fontSize: '26px',
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#232C54',
      marginBottom: '12px',
    },
    featureDesc: {
      color: '#666',
      lineHeight: '1.6',
      fontSize: '15px',
    },
    // ============================================================================
    // PRECIO
    // ============================================================================
    priceSection: {
      background: '#fff',
      padding: '60px 24px',
      textAlign: 'center',
    },
    priceCard: {
      maxWidth: '480px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #232C54 0%, #1a2140 100%)',
      borderRadius: '24px',
      padding: '48px 40px',
      color: '#fff',
      boxShadow: '0 20px 60px rgba(35, 44, 84, 0.3)',
    },
    priceAmount: {
      fontSize: '48px',
      fontWeight: '800',
      marginBottom: '8px',
    },
    priceIva: {
      fontSize: '16px',
      opacity: 0.7,
      marginBottom: '32px',
    },
    priceIncludes: {
      textAlign: 'left',
      marginBottom: '32px',
    },
    priceItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontSize: '15px',
    },
    // ============================================================================
    // FORM STYLES
    // ============================================================================
    formContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 24px',
    },
    progressBar: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '40px',
      position: 'relative',
    },
    progressLine: {
      position: 'absolute',
      top: '20px',
      left: '10%',
      right: '10%',
      height: '3px',
      background: '#e0e0e0',
      zIndex: 0,
    },
    progressLineFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #D85A2D, #e86a3d)',
      transition: 'width 0.4s ease',
    },
    stepIndicator: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 1,
      flex: 1,
    },
    stepCircle: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '16px',
      transition: 'all 0.3s',
      marginBottom: '10px',
    },
    stepLabel: {
      fontSize: '13px',
      fontWeight: '500',
      textAlign: 'center',
    },
    formCard: {
      background: '#fff',
      borderRadius: '20px',
      padding: 'clamp(24px, 5vw, 40px)',
      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    },
    formTitle: {
      fontSize: 'clamp(22px, 4vw, 28px)',
      fontWeight: '700',
      color: '#232C54',
      marginBottom: '8px',
    },
    formSubtitle: {
      color: '#666',
      marginBottom: '32px',
      fontSize: '15px',
    },
    inputGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#333',
      fontSize: '14px',
    },
    labelRequired: {
      color: '#D85A2D',
      marginLeft: '4px',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e8ecf4',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e8ecf4',
      borderRadius: '10px',
      fontSize: '16px',
      minHeight: '100px',
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e8ecf4',
      borderRadius: '10px',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box',
      background: '#fff',
    },
    inputRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    },
    // ============================================================================
    // TIPO PERSONA SELECTOR (V4)
    // ============================================================================
    tipoPersonaSelector: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
    },
    tipoPersonaBtn: {
      flex: 1,
      padding: '16px',
      border: '2px solid #e8ecf4',
      borderRadius: '12px',
      background: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center',
    },
    tipoPersonaBtnActive: {
      borderColor: '#D85A2D',
      background: 'rgba(216, 90, 45, 0.05)',
    },
    tipoPersonaIcon: {
      fontSize: '28px',
      marginBottom: '8px',
    },
    tipoPersonaLabel: {
      fontWeight: '600',
      color: '#232C54',
      fontSize: '14px',
    },
    // ============================================================================
    // ACCIONISTA CARD
    // ============================================================================
    accionistaCard: {
      background: '#f8f9fc',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      border: '2px solid transparent',
    },
    accionistaHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    accionistaTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#232C54',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    accionistaBadge: {
      fontSize: '12px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: '500',
    },
    removeBtn: {
      background: '#fee2e2',
      border: 'none',
      color: '#dc2626',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
    },
    addBtn: {
      width: '100%',
      padding: '16px',
      border: '2px dashed #D85A2D',
      borderRadius: '12px',
      background: 'rgba(216, 90, 45, 0.05)',
      color: '#D85A2D',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    // Capital
    capitalInfo: {
      background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid #d0daf8',
    },
    capitalInfoTitle: {
      fontWeight: '600',
      color: '#232C54',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    capitalPresetGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
      marginBottom: '24px',
    },
    capitalPresetBtn: {
      padding: '16px 12px',
      border: '2px solid #e8ecf4',
      borderRadius: '12px',
      background: '#fff',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
    },
    capitalPresetActive: {
      borderColor: '#D85A2D',
      background: 'rgba(216, 90, 45, 0.05)',
    },
    // Buttons
    buttonRow: {
      display: 'flex',
      gap: '16px',
      marginTop: '32px',
      flexWrap: 'wrap',
    },
    btnPrimary: {
      flex: 1,
      minWidth: '150px',
      background: 'linear-gradient(135deg, #D85A2D 0%, #e86a3d 100%)',
      color: '#fff',
      border: 'none',
      padding: '16px 32px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    btnSecondary: {
      flex: 1,
      minWidth: '150px',
      background: '#f1f5f9',
      color: '#475569',
      border: 'none',
      padding: '16px 32px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '12px',
      cursor: 'pointer',
    },
    // Success
    successCard: {
      textAlign: 'center',
      padding: '48px 24px',
    },
    successIcon: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 28px',
      fontSize: '48px',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
    },
    trackingCodeDisplay: {
      background: 'linear-gradient(135deg, #232C54 0%, #1a2140 100%)',
      color: '#fff',
      padding: '28px',
      borderRadius: '16px',
      marginBottom: '32px',
    },
    trackingCodeValue: {
      fontSize: '36px',
      fontWeight: '800',
      color: '#D85A2D',
      letterSpacing: '4px',
    },
    // Upload
    uploadArea: {
      border: '2px dashed #d0d5dd',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: '#fafafa',
    },
    uploadSuccess: {
      background: '#f0fdf4',
      borderColor: '#22c55e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      cursor: 'pointer',
    },
    checkboxInput: {
      width: '22px',
      height: '22px',
      marginTop: '2px',
      accentColor: '#D85A2D',
    },
    link: {
      color: '#D85A2D',
      textDecoration: 'underline',
    },
    // Tracking
    trackingForm: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
    trackingInput: {
      flex: 1,
      minWidth: '200px',
      padding: '14px 16px',
      border: '2px solid #e8ecf4',
      borderRadius: '10px',
      fontSize: '16px',
      textTransform: 'uppercase',
    },
    statusBadge: {
      display: 'inline-block',
      padding: '8px 20px',
      borderRadius: '50px',
      fontWeight: '600',
      fontSize: '14px',
    },
    infoBox: {
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
    },
  };

  // ============================================================================
  // LANDING PAGE - MEJORADO V4
  // ============================================================================
  const LandingPage = () => (
    <>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroPattern}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            ⚡ Proceso 100% digital
          </div>
          <h1 style={styles.heroTitle}>
            Constituye tu <span style={styles.heroHighlight}>S.A.S.</span><br />
            en Colombia
          </h1>
          <p style={styles.heroSubtitle}>
            Simplificamos el proceso de crear tu empresa. Completa el formulario, 
            nosotros nos encargamos del papeleo legal y la inscripción en Cámara de Comercio.
          </p>
          <div style={styles.heroCTA}>
            <button 
              style={styles.primaryBtn}
              onClick={() => setCurrentView('form')}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Comenzar ahora →
            </button>
            <button 
              style={styles.secondaryBtn}
              onClick={() => setCurrentView('tracking')}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Consultar mi solicitud
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>¿Por qué elegirnos?</h2>
        <p style={styles.sectionSubtitle}>Todo lo que necesitas para crear tu empresa</p>
        
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'}}>
              📝
            </div>
            <h3 style={styles.featureTitle}>Proceso 100% Digital</h3>
            <p style={styles.featureDesc}>
              Completa todo desde tu computador o celular. Sin filas, sin desplazamientos.
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'}}>
              ⚖️
            </div>
            <h3 style={styles.featureTitle}>Abogados Expertos</h3>
            <p style={styles.featureDesc}>
              Nuestro equipo legal revisa cada documento para garantizar el cumplimiento normativo.
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'}}>
              🏢
            </div>
            <h3 style={styles.featureTitle}>Personas Naturales y Jurídicas</h3>
            <p style={styles.featureDesc}>
              Acepta accionistas tanto personas naturales como sociedades (personas jurídicas).
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <div style={{...styles.featureIcon, background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'}}>
              🔍
            </div>
            <h3 style={styles.featureTitle}>Seguimiento en Tiempo Real</h3>
            <p style={styles.featureDesc}>
              Consulta el estado de tu solicitud en cualquier momento con tu código único.
            </p>
          </div>
        </div>
      </section>

      {/* Precio */}
      <section style={styles.priceSection}>
        <h2 style={styles.sectionTitle}>Precio transparente</h2>
        <p style={styles.sectionSubtitle}>Sin costos ocultos ni sorpresas</p>
        
        <div style={styles.priceCard}>
          <div style={styles.priceAmount}>$1.250.000</div>
          <div style={styles.priceIva}>+ IVA (No incluye impuestos de Cámara de Comercio)</div>
          
          <div style={styles.priceIncludes}>
            {['Estatutos sociales personalizados', 'Poderes de constitución', 'Inscripción ante Cámara de Comercio', 'Registro de libros societarios', 'Inscripción del RUT', 'Soporte legal durante el proceso'].map((item, i) => (
              <div key={i} style={styles.priceItem}>
                <span style={{color: '#22c55e'}}>✓</span>
                {item}
              </div>
            ))}
          </div>
          
          <button 
            style={{...styles.primaryBtn, width: '100%', justifyContent: 'center'}}
            onClick={() => setCurrentView('form')}
          >
            Iniciar proceso →
          </button>
        </div>
      </section>
    </>
  );

  // ============================================================================
  // RENDER ACCIONISTA - V4 CON TIPO PERSONA
  // ============================================================================
  const renderAccionista = (acc, index) => {
    const isNatural = acc.tipoPersona === 'natural';
    
    return (
      <div 
        key={acc.id} 
        style={{
          ...styles.accionistaCard,
          borderColor: acc.esGerente ? '#D85A2D' : 'transparent',
        }}
      >
        <div style={styles.accionistaHeader}>
          <div style={styles.accionistaTitle}>
            <span>👤 Accionista {index + 1}</span>
            {acc.esGerente && (
              <span style={{
                ...styles.accionistaBadge,
                background: '#fef3c7',
                color: '#d97706',
              }}>
                👔 Gerente
              </span>
            )}
            <span style={{
              ...styles.accionistaBadge,
              background: isNatural ? '#dbeafe' : '#f3e8ff',
              color: isNatural ? '#1d4ed8' : '#7c3aed',
            }}>
              {isNatural ? 'Persona Natural' : 'Persona Jurídica'}
            </span>
          </div>
          {formData.accionistas.length > 1 && (
            <button 
              style={styles.removeBtn}
              onClick={() => removeAccionista(index)}
            >
              ✕ Eliminar
            </button>
          )}
        </div>

        {/* Selector tipo persona */}
        <div style={styles.tipoPersonaSelector}>
          <button
            type="button"
            style={{
              ...styles.tipoPersonaBtn,
              ...(isNatural ? styles.tipoPersonaBtnActive : {}),
            }}
            onClick={() => handleAccionistaChange(index, 'tipoPersona', 'natural')}
          >
            <div style={styles.tipoPersonaIcon}>👤</div>
            <div style={styles.tipoPersonaLabel}>Persona Natural</div>
          </button>
          <button
            type="button"
            style={{
              ...styles.tipoPersonaBtn,
              ...(!isNatural ? styles.tipoPersonaBtnActive : {}),
            }}
            onClick={() => handleAccionistaChange(index, 'tipoPersona', 'juridica')}
          >
            <div style={styles.tipoPersonaIcon}>🏢</div>
            <div style={styles.tipoPersonaLabel}>Persona Jurídica</div>
          </button>
        </div>

        {/* Campos según tipo de persona */}
        {isNatural ? (
          // ==================== PERSONA NATURAL ====================
          <>
            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Nombres y apellidos<span style={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={acc.nombres}
                  onChange={(e) => handleAccionistaChange(index, 'nombres', e.target.value)}
                  placeholder="Juan Carlos Pérez García"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Nacionalidad<span style={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={acc.nacionalidad}
                  onChange={(e) => handleAccionistaChange(index, 'nacionalidad', e.target.value)}
                  placeholder="Colombiana"
                />
              </div>
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tipo documento<span style={styles.labelRequired}>*</span></label>
                <select
                  style={styles.select}
                  value={acc.tipoDocumento}
                  onChange={(e) => handleAccionistaChange(index, 'tipoDocumento', e.target.value)}
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Número de documento<span style={styles.labelRequired}>*</span></label>
                <input
                  type="text"
                  style={styles.input}
                  value={acc.numeroDocumento}
                  onChange={(e) => handleAccionistaChange(index, 'numeroDocumento', e.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Lugar de expedición<span style={styles.labelRequired}>*</span></label>
                <input
                  type="text"
                  style={styles.input}
                  value={acc.lugarExpedicion}
                  onChange={(e) => handleAccionistaChange(index, 'lugarExpedicion', e.target.value)}
                  placeholder="Bogotá"
                />
              </div>
            </div>
          </>
        ) : (
          // ==================== PERSONA JURÍDICA ====================
          <>
            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Razón Social<span style={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={acc.razonSocial}
                  onChange={(e) => handleAccionistaChange(index, 'razonSocial', e.target.value)}
                  placeholder="INVERSIONES ABC S.A.S."
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  NIT<span style={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  style={styles.input}
                  value={acc.nit}
                  onChange={(e) => handleAccionistaChange(index, 'nit', e.target.value)}
                  placeholder="900123456-7"
                />
              </div>
            </div>

            <div style={{
              background: '#f0f4ff',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{fontWeight: '600', color: '#232C54', marginBottom: '12px'}}>
                👔 Representante Legal de la sociedad accionista
              </div>
              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Nombres completos<span style={styles.labelRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    value={acc.repLegalNombres}
                    onChange={(e) => handleAccionistaChange(index, 'repLegalNombres', e.target.value)}
                    placeholder="María Fernanda López"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Cédula de ciudadanía<span style={styles.labelRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    value={acc.repLegalCedula}
                    onChange={(e) => handleAccionistaChange(index, 'repLegalCedula', e.target.value)}
                    placeholder="52987654"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Campos comunes */}
        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ciudad de domicilio<span style={styles.labelRequired}>*</span></label>
            <input
              type="text"
              style={styles.input}
              value={acc.ciudadDomicilio}
              onChange={(e) => handleAccionistaChange(index, 'ciudadDomicilio', e.target.value)}
              placeholder="Bogotá D.C."
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Dirección</label>
            <input
              type="text"
              style={styles.input}
              value={acc.direccionResidencia}
              onChange={(e) => handleAccionistaChange(index, 'direccionResidencia', e.target.value)}
              placeholder="Calle 100 #15-20"
            />
          </div>
        </div>

        <div style={styles.inputRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email<span style={styles.labelRequired}>*</span></label>
            <input
              type="email"
              style={styles.input}
              value={acc.email}
              onChange={(e) => handleAccionistaChange(index, 'email', e.target.value)}
              placeholder="email@ejemplo.com"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Teléfono<span style={styles.labelRequired}>*</span></label>
            <input
              type="tel"
              style={styles.input}
              value={acc.telefono}
              onChange={(e) => handleAccionistaChange(index, 'telefono', e.target.value)}
              placeholder="3001234567"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>% Participación<span style={styles.labelRequired}>*</span></label>
            <input
              type="number"
              style={styles.input}
              value={acc.porcentaje}
              onChange={(e) => handleAccionistaChange(index, 'porcentaje', e.target.value)}
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Checkbox gerente */}
        <label style={{...styles.checkbox, marginTop: '16px', marginBottom: '16px'}}>
          <input
            type="checkbox"
            checked={acc.esGerente}
            onChange={(e) => handleAccionistaChange(index, 'esGerente', e.target.checked)}
            style={styles.checkboxInput}
          />
          <div>
            <div style={{fontWeight: '600', color: '#232C54'}}>
              Designar como Gerente (Representante Legal)
            </div>
            <div style={{fontSize: '13px', color: '#666'}}>
              {isNatural 
                ? 'Esta persona será quien represente legalmente a la sociedad' 
                : 'El representante legal de esta sociedad actuará como gerente'}
            </div>
          </div>
        </label>

        {/* Upload documento */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            {isNatural ? 'Copia del documento de identidad' : 'RUT o Certificado de Existencia'}
            <span style={styles.labelRequired}>*</span>
          </label>
          <div
            style={{
              ...styles.uploadArea,
              ...(uploadProgress[index] === 'done' ? styles.uploadSuccess : {}),
            }}
            onClick={() => document.getElementById(`file-${acc.id}`).click()}
          >
            <input
              id={`file-${acc.id}`}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{display: 'none'}}
              onChange={(e) => handleFileUpload(index, e.target.files[0])}
            />
            {uploadProgress[index] === 'loading' ? (
              <span>⏳ Cargando...</span>
            ) : uploadProgress[index] === 'done' ? (
              <>
                <span style={{color: '#22c55e', fontWeight: '600'}}>✓</span>
                <span>{acc.documentoFileName}</span>
              </>
            ) : (
              <>
                <div style={{fontSize: '32px', marginBottom: '8px'}}>📄</div>
                <div style={{color: '#666'}}>
                  {isNatural 
                    ? 'Clic para subir cédula (PDF, JPG o PNG)' 
                    : 'Clic para subir RUT o Certificado de Existencia'}
                </div>
                <div style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>Máximo 10MB</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // FORM WIZARD
  // ============================================================================
  const FormWizard = () => (
    <div style={styles.formContainer}>
      {/* Progress Bar */}
      <div style={styles.progressBar}>
        <div style={styles.progressLine}>
          <div style={{
            ...styles.progressLineFill,
            width: `${((currentStep - 1) / 3) * 100}%`,
          }}></div>
        </div>
        {['Empresa', 'Accionistas', 'Confirmar', 'Listo'].map((label, i) => (
          <div key={i} style={styles.stepIndicator}>
            <div style={{
              ...styles.stepCircle,
              background: currentStep > i + 1 ? '#22c55e' : currentStep === i + 1 ? '#D85A2D' : '#e5e7eb',
              color: currentStep >= i + 1 ? '#fff' : '#9ca3af',
            }}>
              {currentStep > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{
              ...styles.stepLabel,
              color: currentStep >= i + 1 ? '#232C54' : '#9ca3af',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.formCard}>
        {/* Step 1: Datos de la empresa */}
        {currentStep === 1 && (
          <>
            <h2 style={styles.formTitle}>Datos de tu empresa</h2>
            <p style={styles.formSubtitle}>Información básica para constituir tu S.A.S.</p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Nombre de la empresa<span style={styles.labelRequired}>*</span>
              </label>
              <input
                type="text"
                name="nombreEmpresa"
                style={styles.input}
                value={formData.nombreEmpresa}
                onChange={handleInputChange}
                placeholder="Mi Empresa (sin S.A.S.)"
              />
              <small style={{color: '#666', fontSize: '13px'}}>
                Se agregará automáticamente "S.A.S." al final
              </small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Objeto social / Actividad económica<span style={styles.labelRequired}>*</span>
              </label>
              <textarea
                name="objetoSocial"
                style={styles.textarea}
                value={formData.objetoSocial}
                onChange={handleInputChange}
                placeholder="Describe las actividades que realizará tu empresa. Ej: Desarrollo de software, consultoría tecnológica, comercialización de productos digitales..."
              />
              <small style={{color: '#666', fontSize: '13px'}}>
                Describe claramente qué hará tu empresa. Esto aparecerá en los estatutos.
              </small>
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Ciudad de domicilio<span style={styles.labelRequired}>*</span>
                </label>
                <input
                  type="text"
                  name="ciudadSociedad"
                  style={styles.input}
                  value={formData.ciudadSociedad}
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Dirección</label>
                <input
                  type="text"
                  name="direccionSociedad"
                  style={styles.input}
                  value={formData.direccionSociedad}
                  onChange={handleInputChange}
                  placeholder="Calle/Carrera..."
                />
              </div>
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Teléfono</label>
                <input
                  type="tel"
                  name="telefonoSociedad"
                  style={styles.input}
                  value={formData.telefonoSociedad}
                  onChange={handleInputChange}
                  placeholder="3001234567"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email de la empresa</label>
                <input
                  type="email"
                  name="emailSociedad"
                  style={styles.input}
                  value={formData.emailSociedad}
                  onChange={handleInputChange}
                  placeholder="contacto@miempresa.com"
                />
              </div>
            </div>

            {/* Capital Social */}
            <div style={styles.capitalInfo}>
              <div style={styles.capitalInfoTitle}>
                💡 ¿Qué es el capital social?
              </div>
              <p style={{fontSize: '14px', color: '#555', lineHeight: '1.6', margin: 0}}>
                <strong>Autorizado:</strong> Límite máximo de capital que puede tener la empresa.<br/>
                <strong>Suscrito:</strong> Capital que los accionistas se comprometen a aportar.<br/>
                <strong>Pagado:</strong> Capital efectivamente aportado al momento de la constitución.
              </p>
            </div>

            <label style={styles.label}>Selecciona un esquema de capital</label>
            <div style={styles.capitalPresetGrid}>
              {[
                { key: 'startup', label: 'Startup', auth: '100M', sus: '1M' },
                { key: 'pyme', label: 'PyME', auth: '500M', sus: '50M' },
                { key: 'grande', label: 'Grande', auth: '1.000M', sus: '100M' },
                { key: 'personalizado', label: 'Personalizado', auth: '...', sus: '...' },
              ].map(preset => (
                <button
                  key={preset.key}
                  type="button"
                  style={{
                    ...styles.capitalPresetBtn,
                    ...(formData.capitalPreset === preset.key ? styles.capitalPresetActive : {}),
                  }}
                  onClick={() => handleCapitalPreset(preset.key)}
                >
                  <div style={{fontWeight: '600', color: '#232C54', marginBottom: '4px'}}>
                    {preset.label}
                  </div>
                  <div style={{fontSize: '12px', color: '#666'}}>
                    Aut: {preset.auth} / Sus: {preset.sus}
                  </div>
                </button>
              ))}
            </div>

            {formData.capitalPreset === 'personalizado' && (
              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Capital Autorizado</label>
                  <input
                    type="number"
                    name="capitalAutorizado"
                    style={styles.input}
                    value={formData.capitalAutorizado}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Capital Suscrito</label>
                  <input
                    type="number"
                    name="capitalSuscrito"
                    style={styles.input}
                    value={formData.capitalSuscrito}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Capital Pagado</label>
                  <input
                    type="number"
                    name="capitalPagado"
                    style={styles.input}
                    value={formData.capitalPagado}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div style={styles.buttonRow}>
              <button 
                type="button" 
                style={styles.btnSecondary}
                onClick={() => setCurrentView('landing')}
              >
                ← Volver
              </button>
              <button 
                type="button" 
                style={styles.btnPrimary}
                onClick={nextStep}
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Accionistas */}
        {currentStep === 2 && (
          <>
            <h2 style={styles.formTitle}>Accionistas</h2>
            <p style={styles.formSubtitle}>
              Puedes agregar personas naturales o jurídicas como accionistas
            </p>

            {formData.accionistas.map((acc, index) => renderAccionista(acc, index))}

            {/* Resumen porcentajes */}
            <div style={{
              background: totalPorcentaje === 100 ? '#f0fdf4' : '#fef3c7',
              border: `1px solid ${totalPorcentaje === 100 ? '#86efac' : '#fcd34d'}`,
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{fontWeight: '500'}}>Total participación:</span>
              <span style={{
                fontWeight: '700',
                fontSize: '20px',
                color: totalPorcentaje === 100 ? '#16a34a' : '#d97706',
              }}>
                {totalPorcentaje}%
              </span>
            </div>

            <button
              type="button"
              style={styles.addBtn}
              onClick={addAccionista}
            >
              + Agregar otro accionista
            </button>

            <div style={styles.buttonRow}>
              <button 
                type="button" 
                style={styles.btnSecondary}
                onClick={prevStep}
              >
                ← Anterior
              </button>
              <button 
                type="button" 
                style={styles.btnPrimary}
                onClick={nextStep}
              >
                Continuar →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirmación */}
        {currentStep === 3 && (
          <>
            <h2 style={styles.formTitle}>Confirma tu solicitud</h2>
            <p style={styles.formSubtitle}>Revisa la información antes de enviar</p>

            {/* Resumen empresa */}
            <div style={{background: '#f8f9fc', borderRadius: '12px', padding: '20px', marginBottom: '20px'}}>
              <h3 style={{margin: '0 0 16px', color: '#232C54'}}>🏢 Datos de la empresa</h3>
              <div style={{display: 'grid', gap: '8px'}}>
                <div><strong>Nombre:</strong> {formData.nombreEmpresa} S.A.S.</div>
                <div><strong>Objeto social:</strong> {formData.objetoSocial}</div>
                <div><strong>Ciudad:</strong> {formData.ciudadSociedad}</div>
                <div><strong>Capital pagado:</strong> {formatCurrency(formData.capitalPagado)}</div>
              </div>
            </div>

            {/* Resumen accionistas */}
            <div style={{background: '#f8f9fc', borderRadius: '12px', padding: '20px', marginBottom: '20px'}}>
              <h3 style={{margin: '0 0 16px', color: '#232C54'}}>👥 Accionistas ({formData.accionistas.length})</h3>
              {formData.accionistas.map((acc, i) => {
                const isNatural = acc.tipoPersona === 'natural';
                const nombre = isNatural ? acc.nombres : acc.razonSocial;
                const doc = isNatural ? `${acc.tipoDocumento} ${acc.numeroDocumento}` : `NIT ${acc.nit}`;
                
                return (
                  <div key={i} style={{
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: acc.esGerente ? '2px solid #D85A2D' : '1px solid #e5e7eb',
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <div style={{fontWeight: '600'}}>
                          {isNatural ? '👤' : '🏢'} {nombre || 'Sin nombre'}
                        </div>
                        <div style={{fontSize: '13px', color: '#666'}}>{doc}</div>
                        {!isNatural && acc.repLegalNombres && (
                          <div style={{fontSize: '13px', color: '#666'}}>
                            Rep. Legal: {acc.repLegalNombres}
                          </div>
                        )}
                      </div>
                      <div style={{textAlign: 'right'}}>
                        <div style={{fontWeight: '700', color: '#D85A2D'}}>{acc.porcentaje}%</div>
                        {acc.esGerente && <div style={{fontSize: '12px', color: '#d97706'}}>👔 Gerente</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alertas */}
            {tieneExtranjeros && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px',
              }}>
                ⚠️ <strong>Hay accionistas extranjeros.</strong> Se requieren documentos adicionales para el proceso.
              </div>
            )}

            {/* Política de datos */}
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                name="aceptaPolitica"
                checked={formData.aceptaPolitica}
                onChange={handleInputChange}
                style={styles.checkboxInput}
              />
              <span style={{fontSize: '14px', color: '#555'}}>
                Acepto la{' '}
                <a 
                  href="https://cdn.prod.website-files.com/68d59253eac398f3c33af169/69174eb3a1ff60c9541a18d2_Poli%CC%81tica%20de%20proteccio%CC%81n%20de%20Datos%20Due%20Legal%20(1).docx.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  política de tratamiento de datos personales
                </a>
              </span>
            </label>

            <div style={styles.buttonRow}>
              <button 
                type="button" 
                style={styles.btnSecondary}
                onClick={prevStep}
              >
                ← Anterior
              </button>
              <button 
                type="button" 
                style={{
                  ...styles.btnPrimary,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Enviando...' : '✓ Enviar solicitud'}
              </button>
            </div>
          </>
        )}

        {/* Step 4: Éxito */}
        {currentStep === 4 && (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={{fontSize: '28px', color: '#232C54', marginBottom: '16px'}}>
              ¡Solicitud enviada!
            </h2>
            <p style={{color: '#666', marginBottom: '32px'}}>
              Hemos recibido tu información. Un abogado la revisará pronto.
            </p>
            
            <div style={styles.trackingCodeDisplay}>
              <div style={{marginBottom: '8px', opacity: 0.8}}>Tu código de seguimiento:</div>
              <div style={styles.trackingCodeValue}>{trackingCode}</div>
            </div>
            
            <p style={{fontSize: '14px', color: '#666', marginBottom: '32px'}}>
              Guarda este código para consultar el estado de tu solicitud.
              También te enviamos un email de confirmación.
            </p>
            
            <button 
              style={styles.btnPrimary}
              onClick={() => {
                setCurrentView('landing');
                setCurrentStep(1);
                setFormData({
                  nombreEmpresa: '',
                  objetoSocial: '',
                  ciudadSociedad: 'Bogotá D.C.',
                  direccionSociedad: '',
                  telefonoSociedad: '',
                  emailSociedad: '',
                  capitalPreset: 'startup',
                  capitalAutorizado: '100000000',
                  capitalSuscrito: '1000000',
                  capitalPagado: '1000000',
                  accionistas: [{
                    id: 1,
                    tipoPersona: 'natural',
                    nombres: '',
                    tipoDocumento: 'CC',
                    numeroDocumento: '',
                    lugarExpedicion: '',
                    nacionalidad: 'Colombiana',
                    razonSocial: '',
                    nit: '',
                    repLegalNombres: '',
                    repLegalCedula: '',
                    ciudadDomicilio: '',
                    direccionResidencia: '',
                    email: '',
                    telefono: '',
                    porcentaje: 100,
                    esGerente: true,
                    documentoFile: null,
                    documentoFileName: '',
                    documentoBase64: '',
                  }],
                  gerenteSuplente: {
                    tiene: false,
                    nombres: '',
                    tipoDocumento: 'CC',
                    numeroDocumento: '',
                    lugarExpedicion: '',
                  },
                  aceptaPolitica: false,
                });
              }}
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // TRACKING PAGE
  // ============================================================================
  const TrackingPage = () => {
    const getStatusColor = (estado) => {
      const colors = {
        'Recibida': { bg: '#e0f2fe', text: '#0369a1' },
        'En revisión': { bg: '#fef3c7', text: '#d97706' },
        'Documentos listos': { bg: '#d1fae5', text: '#059669' },
        'Pendiente firma': { bg: '#fce7f3', text: '#be185d' },
        'Pendiente pago': { bg: '#fee2e2', text: '#dc2626' },
        'En Cámara': { bg: '#e0e7ff', text: '#4338ca' },
        'Constituida': { bg: '#dcfce7', text: '#16a34a' },
        'Cancelada': { bg: '#f3f4f6', text: '#6b7280' },
      };
      return colors[estado] || colors['Recibida'];
    };

    return (
      <div style={styles.formContainer}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Consulta tu solicitud</h2>
          <p style={styles.formSubtitle}>Ingresa tu código de seguimiento</p>
          
          <form onSubmit={handleTrackingSubmit} style={styles.trackingForm}>
            <input
              type="text"
              name="codigo"
              style={styles.trackingInput}
              placeholder="Ej: DL-ABC123"
              maxLength={10}
            />
            <button 
              type="submit" 
              style={styles.btnPrimary}
              disabled={trackingLoading}
            >
              {trackingLoading ? '⏳' : '🔍'} Buscar
            </button>
          </form>
          
          {trackingError && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '16px',
              color: '#dc2626',
              marginBottom: '20px',
            }}>
              ❌ {trackingError}
            </div>
          )}
          
          {trackingData && (
            <div style={{
              background: '#f8f9fc',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{textAlign: 'center', marginBottom: '24px'}}>
                <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Estado actual</div>
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(trackingData.estado).bg,
                  color: getStatusColor(trackingData.estado).text,
                }}>
                  {trackingData.estado}
                </span>
              </div>
              
              <div style={{display: 'grid', gap: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#666'}}>Código:</span>
                  <strong>{trackingData.codigo}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: '#666'}}>Empresa:</span>
                  <strong>{trackingData.empresa}</strong>
                </div>
                {trackingData.nit && (
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#666'}}>NIT:</span>
                    <strong>{trackingData.nit}</strong>
                  </div>
                )}
              </div>
              
              {trackingData.estado === 'Constituida' && trackingData.certificadoUrl && (
                <div style={styles.infoBox}>
                  <div style={{fontWeight: '600', color: '#16a34a', marginBottom: '12px'}}>
                    🎉 ¡Tu empresa está constituida!
                  </div>
                  <a 
                    href={trackingData.certificadoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      background: '#16a34a',
                      color: '#fff',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: '600',
                    }}
                  >
                    📄 Descargar Certificado
                  </a>
                </div>
              )}
            </div>
          )}
          
          <button 
            type="button"
            style={{...styles.btnSecondary, marginTop: '24px', width: '100%'}}
            onClick={() => setCurrentView('landing')}
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================
  return (
    <div style={styles.container}>
      {currentView !== 'landing' && (
        <header style={styles.header}>
          <div style={styles.logo}>Due Legal</div>
          <button 
            style={styles.backBtn}
            onClick={() => setCurrentView('landing')}
          >
            ← Inicio
          </button>
        </header>
      )}

      {currentView === 'landing' && (
        <header style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <div style={{...styles.logo, color: '#fff'}}>Due Legal</div>
        </header>
      )}

      {currentView === 'landing' && <LandingPage />}
      {currentView === 'form' && <FormWizard />}
      {currentView === 'tracking' && <TrackingPage />}

      {/* Footer */}
      <footer style={{
        background: '#232C54',
        color: '#fff',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{fontSize: '20px', fontWeight: '700', marginBottom: '12px'}}>Due Legal</div>
        <p style={{opacity: 0.7, marginBottom: '16px'}}>
          Simplificamos el derecho para tu empresa
        </p>
        <div style={{fontSize: '14px', opacity: 0.5}}>
          © 2026 Due Legal. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
