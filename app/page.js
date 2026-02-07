'use client';

import { useState } from 'react';

export default function ConstitucionSAS() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkoHMBlomaB3DJ_kGuGxjUXmqTavXie5YKHeQUoqQo1XDckNo5wBS6SNCKOk79BU3C/exec';
  
  // Estado del formulario separado para evitar re-renders
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [objetoSocial, setObjetoSocial] = useState('');
  const [ciudadSociedad, setCiudadSociedad] = useState('Bogotá D.C.');
  const [direccionSociedad, setDireccionSociedad] = useState('');
  const [telefonoSociedad, setTelefonoSociedad] = useState('');
  const [emailSociedad, setEmailSociedad] = useState('');
  const [capitalPreset, setCapitalPreset] = useState('startup');
  const [capitalAutorizado, setCapitalAutorizado] = useState('100000000');
  const [capitalSuscrito, setCapitalSuscrito] = useState('1000000');
  const [capitalPagado, setCapitalPagado] = useState('1000000');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  
  const [accionistas, setAccionistas] = useState([{
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
    documentoFileName: '',
    documentoBase64: '',
  }]);

  const tieneExtranjeros = accionistas.some(a => 
    a.tipoPersona === 'natural' && a.nacionalidad.toLowerCase() !== 'colombiana' && a.nacionalidad !== ''
  );

  const totalPorcentaje = accionistas.reduce((sum, a) => sum + (parseFloat(a.porcentaje) || 0), 0);

  // Función para actualizar un accionista específico
  const updateAccionista = (index, field, value) => {
    setAccionistas(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Si se marca como gerente, desmarcar los demás
      if (field === 'esGerente' && value === true) {
        updated.forEach((acc, i) => {
          if (i !== index) updated[i] = { ...updated[i], esGerente: false };
        });
      }
      return updated;
    });
  };

  const handleFileUpload = (index, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 10MB.');
      return;
    }
    setUploadProgress(prev => ({ ...prev, [index]: 'loading' }));
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      updateAccionista(index, 'documentoFileName', file.name);
      updateAccionista(index, 'documentoBase64', base64);
      setUploadProgress(prev => ({ ...prev, [index]: 'done' }));
    };
    reader.readAsDataURL(file);
  };

  const addAccionista = () => {
    const restante = Math.max(0, 100 - totalPorcentaje);
    setAccionistas(prev => [...prev, {
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
      documentoFileName: '',
      documentoBase64: '',
    }]);
  };

  const removeAccionista = (index) => {
    if (accionistas.length <= 1) return;
    setAccionistas(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (!updated.some(a => a.esGerente)) {
        updated[0] = { ...updated[0], esGerente: true };
      }
      return updated;
    });
  };

  const handleCapitalPreset = (preset) => {
    setCapitalPreset(preset);
    if (preset === 'startup') {
      setCapitalAutorizado('100000000');
      setCapitalSuscrito('1000000');
      setCapitalPagado('1000000');
    } else if (preset === 'pyme') {
      setCapitalAutorizado('500000000');
      setCapitalSuscrito('50000000');
      setCapitalPagado('50000000');
    } else if (preset === 'grande') {
      setCapitalAutorizado('1000000000');
      setCapitalSuscrito('100000000');
      setCapitalPagado('100000000');
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!nombreEmpresa.trim()) { alert('Ingresa el nombre de la empresa'); return false; }
      if (!objetoSocial.trim()) { alert('Describe el objeto social'); return false; }
      if (!ciudadSociedad.trim()) { alert('Ingresa la ciudad'); return false; }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < accionistas.length; i++) {
        const acc = accionistas[i];
        if (acc.tipoPersona === 'natural') {
          if (!acc.nombres.trim()) { alert(`Ingresa los nombres del accionista ${i + 1}`); return false; }
          if (!acc.numeroDocumento.trim()) { alert(`Ingresa el documento del accionista ${i + 1}`); return false; }
        } else {
          if (!acc.razonSocial.trim()) { alert(`Ingresa la razón social del accionista ${i + 1}`); return false; }
          if (!acc.nit.trim()) { alert(`Ingresa el NIT del accionista ${i + 1}`); return false; }
          if (!acc.repLegalNombres.trim()) { alert(`Ingresa el rep. legal del accionista ${i + 1}`); return false; }
          if (!acc.repLegalCedula.trim()) { alert(`Ingresa la cédula del rep. legal del accionista ${i + 1}`); return false; }
        }
        if (!acc.email.trim()) { alert(`Ingresa el email del accionista ${i + 1}`); return false; }
      }
      if (Math.abs(totalPorcentaje - 100) > 0.01) { alert(`Los porcentajes deben sumar 100%. Actualmente: ${totalPorcentaje}%`); return false; }
      return true;
    }
    if (step === 3) {
      if (!aceptaPolitica) { alert('Debes aceptar la política de datos'); return false; }
      return true;
    }
    return true;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(s => Math.min(s + 1, 4)); };
  const prevStep = () => { setCurrentStep(s => Math.max(s - 1, 1)); };

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DL-';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    const newCode = generateTrackingCode();
    try {
      const payload = {
        trackingCode: newCode,
        empresa: {
          nombre: nombreEmpresa.toUpperCase(),
          objetoSocial: objetoSocial,
          ciudad: ciudadSociedad,
          direccion: direccionSociedad,
          telefono: telefonoSociedad,
          email: emailSociedad,
        },
        capital: {
          autorizado: capitalAutorizado,
          suscrito: capitalSuscrito,
          pagado: capitalPagado,
          valorAccion: '1000',
        },
        accionistas: accionistas.map(acc => ({
          tipoPersona: acc.tipoPersona,
          nombres: acc.nombres.toUpperCase(),
          tipoDocumento: acc.tipoDocumento,
          numeroDocumento: acc.numeroDocumento,
          lugarExpedicion: acc.lugarExpedicion,
          nacionalidad: acc.nacionalidad,
          razonSocial: acc.razonSocial?.toUpperCase() || '',
          nit: acc.nit || '',
          repLegalNombres: acc.repLegalNombres?.toUpperCase() || '',
          repLegalCedula: acc.repLegalCedula || '',
          ciudadDomicilio: acc.ciudadDomicilio,
          direccionResidencia: acc.direccionResidencia,
          email: acc.email,
          telefono: acc.telefono,
          porcentaje: parseFloat(acc.porcentaje),
          esGerente: acc.esGerente,
          documentoFileName: acc.documentoFileName,
          documentoBase64: acc.documentoBase64,
        })),
        tieneExtranjeros,
      };
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setTrackingCode(newCode);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error:', error);
      setTrackingCode(newCode);
      setCurrentStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    const codigo = e.target.codigo.value.trim().toUpperCase();
    if (!codigo) { setTrackingError('Ingresa un código'); return; }
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingData(null);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?codigo=${codigo}`);
      const data = await response.json();
      if (data.success) setTrackingData(data.data);
      else setTrackingError(data.error || 'No encontrado');
    } catch (error) {
      setTrackingError('Error al consultar');
    } finally {
      setTrackingLoading(false);
    }
  };

  const formatCurrency = (num) => '$' + parseInt(num || 0).toLocaleString('es-CO');

  const getStatusColor = (estado) => {
    const colors = {
      'Recibida': { bg: '#e0f2fe', text: '#0369a1' },
      'En revisión': { bg: '#fef3c7', text: '#d97706' },
      'Documentos listos': { bg: '#d1fae5', text: '#059669' },
      'Pendiente firma': { bg: '#fce7f3', text: '#be185d' },
      'Pendiente pago': { bg: '#fee2e2', text: '#dc2626' },
      'En Cámara': { bg: '#e0e7ff', text: '#4338ca' },
      'Constituida': { bg: '#dcfce7', text: '#16a34a' },
    };
    return colors[estado] || colors['Recibida'];
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .container { min-height: 100vh; background: linear-gradient(135deg, #f8f9fc 0%, #e8ecf4 100%); font-family: 'Inter', -apple-system, sans-serif; }
        .header { background: linear-gradient(135deg, #232C54 0%, #1a2140 100%); padding: 20px 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: 700; }
        .back-btn { background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .hero { background: linear-gradient(135deg, #232C54 0%, #1a2140 100%); padding: 100px 24px 80px; text-align: center; color: #fff; }
        .hero-badge { display: inline-block; background: rgba(216, 90, 45, 0.2); border: 1px solid rgba(216, 90, 45, 0.4); padding: 8px 16px; border-radius: 50px; font-size: 14px; margin-bottom: 24px; color: #FFB088; }
        .hero-title { font-size: clamp(32px, 6vw, 52px); font-weight: 800; margin-bottom: 20px; }
        .hero-highlight { background: linear-gradient(90deg, #D85A2D, #FF8C5A); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 18px; opacity: 0.85; max-width: 600px; margin: 0 auto 40px; }
        .btn-primary { background: linear-gradient(135deg, #D85A2D 0%, #e86a3d 100%); color: #fff; border: none; padding: 18px 48px; font-size: 18px; font-weight: 600; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 20px rgba(216, 90, 45, 0.4); }
        .btn-secondary { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.3); padding: 16px 40px; font-size: 16px; border-radius: 12px; cursor: pointer; margin-top: 16px; }
        .btn-gray { background: #f1f5f9; color: #475569; border: none; padding: 16px 32px; font-size: 16px; font-weight: 600; border-radius: 12px; cursor: pointer; }
        .btn-orange { background: linear-gradient(135deg, #D85A2D, #e86a3d); color: #fff; border: none; padding: 16px 32px; font-size: 16px; font-weight: 600; border-radius: 12px; cursor: pointer; }
        .features { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
        .features-title { text-align: center; font-size: 32px; font-weight: 700; color: #232C54; margin-bottom: 48px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .feature-card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .feature-icon { font-size: 32px; margin-bottom: 16px; }
        .feature-title { font-size: 20px; font-weight: 600; color: #232C54; margin-bottom: 8px; }
        .feature-desc { color: #666; }
        .price-section { background: #fff; padding: 60px 24px; text-align: center; }
        .price-card { max-width: 400px; margin: 0 auto; background: linear-gradient(135deg, #232C54 0%, #1a2140 100%); border-radius: 24px; padding: 40px; color: #fff; }
        .price-amount { font-size: 48px; font-weight: 800; }
        .price-iva { opacity: 0.7; margin-bottom: 24px; }
        .form-container { max-width: 800px; margin: 0 auto; padding: 40px 24px; }
        .progress { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .progress-step { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .progress-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-bottom: 8px; }
        .progress-label { font-size: 13px; }
        .form-card { background: #fff; border-radius: 20px; padding: clamp(24px, 5vw, 40px); box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
        .form-title { font-size: 28px; font-weight: 700; color: #232C54; margin-bottom: 8px; }
        .form-subtitle { color: #666; margin-bottom: 32px; }
        .input-group { margin-bottom: 24px; }
        .label { display: block; margin-bottom: 8px; font-weight: 500; }
        .required { color: #D85A2D; }
        .input { width: 100%; padding: 14px 16px; border: 2px solid #e8ecf4; border-radius: 10px; font-size: 16px; }
        .input:focus { outline: none; border-color: #D85A2D; }
        .textarea { width: 100%; padding: 14px 16px; border: 2px solid #e8ecf4; border-radius: 10px; font-size: 16px; min-height: 100px; font-family: inherit; resize: vertical; }
        .textarea:focus { outline: none; border-color: #D85A2D; }
        .input-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .input-row-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .capital-info { background: #f0f4ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .capital-title { font-weight: 600; color: #232C54; margin-bottom: 12px; }
        .capital-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .capital-btn { padding: 16px; border: 2px solid #e8ecf4; border-radius: 12px; background: #fff; cursor: pointer; text-align: center; }
        .capital-btn.active { border-color: #D85A2D; background: rgba(216,90,45,0.05); }
        .capital-label { font-weight: 600; color: #232C54; }
        .capital-desc { font-size: 12px; color: #666; }
        .btn-row { display: flex; gap: 16px; margin-top: 32px; }
        .btn-row button { flex: 1; }
        .accionista-card { background: #f8f9fc; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 2px solid transparent; }
        .accionista-card.gerente { border-color: #D85A2D; }
        .accionista-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .accionista-title { font-weight: 600; font-size: 18px; display: flex; align-items: center; gap: 10px; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; }
        .badge-gerente { background: #fef3c7; color: #d97706; }
        .btn-remove { background: #fee2e2; border: none; color: #dc2626; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .tipo-persona { display: flex; gap: 12px; margin-bottom: 24px; }
        .tipo-btn { flex: 1; padding: 16px; border: 2px solid #e8ecf4; border-radius: 12px; background: #fff; cursor: pointer; text-align: center; }
        .tipo-btn.active { border-color: #D85A2D; background: rgba(216,90,45,0.05); }
        .tipo-icon { font-size: 28px; }
        .tipo-label { font-weight: 600; }
        .rep-legal-box { background: #f0f4ff; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .rep-legal-title { font-weight: 600; margin-bottom: 12px; }
        .checkbox-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; cursor: pointer; }
        .checkbox { width: 20px; height: 20px; accent-color: #D85A2D; }
        .upload-area { border: 2px dashed #d0d5dd; border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; background: #fafafa; }
        .upload-area.done { background: #f0fdf4; border-color: #22c55e; }
        .upload-icon { font-size: 32px; margin-bottom: 8px; }
        .upload-text { color: #666; }
        .porcentaje-bar { border-radius: 10px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .porcentaje-bar.ok { background: #f0fdf4; border: 1px solid #86efac; }
        .porcentaje-bar.warning { background: #fef3c7; border: 1px solid #fcd34d; }
        .porcentaje-value { font-weight: 700; font-size: 20px; }
        .porcentaje-value.ok { color: #16a34a; }
        .porcentaje-value.warning { color: #d97706; }
        .btn-add { width: 100%; padding: 16px; border: 2px dashed #D85A2D; border-radius: 12px; background: rgba(216,90,45,0.05); color: #D85A2D; font-size: 16px; font-weight: 600; cursor: pointer; }
        .summary-box { background: #f8f9fc; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .summary-title { margin: 0 0 16px; }
        .summary-item { padding: 12px; background: #fff; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .summary-item.gerente { border: 2px solid #D85A2D; }
        .alert-warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; margin-bottom: 20px; }
        .policy-check { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
        .policy-checkbox { width: 22px; height: 22px; margin-top: 2px; accent-color: #D85A2D; }
        .policy-link { color: #D85A2D; }
        .success-card { text-align: center; padding: 48px 24px; }
        .success-icon { width: 100px; height: 100px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; font-size: 48px; color: #fff; }
        .tracking-display { background: linear-gradient(135deg, #232C54, #1a2140); color: #fff; padding: 28px; border-radius: 16px; margin-bottom: 32px; }
        .tracking-code { font-size: 36px; font-weight: 800; color: #D85A2D; letter-spacing: 4px; }
        .tracking-container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
        .tracking-form { display: flex; gap: 12px; margin-bottom: 24px; }
        .tracking-input { flex: 1; padding: 14px 16px; border: 2px solid #e8ecf4; border-radius: 10px; font-size: 16px; text-transform: uppercase; }
        .tracking-result { background: #f8f9fc; border-radius: 16px; padding: 24px; }
        .status-badge { display: inline-block; padding: 8px 20px; border-radius: 50px; font-weight: 600; }
        .tracking-info { display: grid; gap: 12px; }
        .tracking-row { display: flex; justify-content: space-between; }
        .docs-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-top: 20px; }
        .docs-title { font-weight: 600; color: #16a34a; margin-bottom: 16px; font-size: 18px; }
        .doc-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
        .doc-link { background: #D85A2D; color: #fff; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; }
        .error-box { background: #fee2e2; border: 1px solid #fecaca; border-radius: 10px; padding: 16px; color: #dc2626; margin-bottom: 20px; }
        .footer { background: #232C54; color: #fff; padding: 40px 24px; text-align: center; }
        .footer-logo { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
        .footer-text { opacity: 0.7; margin-bottom: 16px; }
        .footer-copy { font-size: 14px; opacity: 0.5; }
      `}</style>

      <div className="container">
        {/* HEADER */}
        {currentView !== 'landing' && (
          <header className="header">
            <div className="logo">Due Legal</div>
            <button className="back-btn" onClick={() => setCurrentView('landing')}>← Inicio</button>
          </header>
        )}

        {/* LANDING */}
        {currentView === 'landing' && (
          <>
            <header className="header">
              <div className="logo">Due Legal</div>
            </header>
            
            <section className="hero">
              <div className="hero-badge">⚡ Proceso 100% digital</div>
              <h1 className="hero-title">
                Constituye tu <span className="hero-highlight">S.A.S.</span><br />en Colombia
              </h1>
              <p className="hero-subtitle">Simplificamos el proceso de crear tu empresa. Completa el formulario, nosotros nos encargamos del papeleo.</p>
              <button className="btn-primary" onClick={() => setCurrentView('form')}>Comenzar ahora →</button>
              <br />
              <button className="btn-secondary" onClick={() => setCurrentView('tracking')}>Consultar mi solicitud</button>
            </section>

            <section className="features">
              <h2 className="features-title">¿Por qué elegirnos?</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">📝</div>
                  <h3 className="feature-title">Proceso Digital</h3>
                  <p className="feature-desc">Completa todo desde tu computador o celular.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">⚖️</div>
                  <h3 className="feature-title">Abogados Expertos</h3>
                  <p className="feature-desc">Nuestro equipo revisa cada documento.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🏢</div>
                  <h3 className="feature-title">Personas Naturales y Jurídicas</h3>
                  <p className="feature-desc">Acepta todo tipo de accionistas.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🔍</div>
                  <h3 className="feature-title">Seguimiento en Tiempo Real</h3>
                  <p className="feature-desc">Consulta el estado con tu código.</p>
                </div>
              </div>
            </section>

            <section className="price-section">
              <h2 className="features-title">Precio transparente</h2>
              <div className="price-card">
                <div className="price-amount">$1.250.000</div>
                <div className="price-iva">+ IVA</div>
                <button className="btn-primary" style={{width: '100%'}} onClick={() => setCurrentView('form')}>Iniciar proceso →</button>
              </div>
            </section>
          </>
        )}

        {/* FORMULARIO */}
        {currentView === 'form' && (
          <div className="form-container">
            <div className="progress">
              {['Empresa', 'Accionistas', 'Confirmar', 'Listo'].map((label, i) => (
                <div key={label} className="progress-step">
                  <div className="progress-circle" style={{
                    background: currentStep > i + 1 ? '#22c55e' : currentStep === i + 1 ? '#D85A2D' : '#e5e7eb',
                    color: currentStep >= i + 1 ? '#fff' : '#9ca3af'
                  }}>
                    {currentStep > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className="progress-label" style={{ color: currentStep >= i + 1 ? '#232C54' : '#9ca3af' }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="form-card">
              {/* PASO 1 */}
              {currentStep === 1 && (
                <>
                  <h2 className="form-title">Datos de tu empresa</h2>
                  <p className="form-subtitle">Información básica para constituir tu S.A.S.</p>

                  <div className="input-group">
                    <label className="label">Nombre de la empresa <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="input" 
                      value={nombreEmpresa} 
                      onChange={(e) => setNombreEmpresa(e.target.value)} 
                      placeholder="Mi Empresa (sin S.A.S.)" 
                    />
                  </div>

                  <div className="input-group">
                    <label className="label">Objeto social <span className="required">*</span></label>
                    <textarea 
                      className="textarea" 
                      value={objetoSocial} 
                      onChange={(e) => setObjetoSocial(e.target.value)} 
                      placeholder="Describe las actividades de tu empresa..."
                    />
                  </div>

                  <div className="input-row">
                    <div>
                      <label className="label">Ciudad <span className="required">*</span></label>
                      <input type="text" className="input" value={ciudadSociedad} onChange={(e) => setCiudadSociedad(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Dirección</label>
                      <input type="text" className="input" value={direccionSociedad} onChange={(e) => setDireccionSociedad(e.target.value)} placeholder="Calle/Carrera..." />
                    </div>
                  </div>

                  <div className="input-row">
                    <div>
                      <label className="label">Teléfono</label>
                      <input type="tel" className="input" value={telefonoSociedad} onChange={(e) => setTelefonoSociedad(e.target.value)} placeholder="3001234567" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input type="email" className="input" value={emailSociedad} onChange={(e) => setEmailSociedad(e.target.value)} placeholder="contacto@empresa.com" />
                    </div>
                  </div>

                  <div className="capital-info">
                    <div className="capital-title">💡 Capital Social</div>
                    <p style={{fontSize: '14px', color: '#555', margin: 0}}>
                      <strong>Autorizado:</strong> Límite máximo. <strong>Suscrito:</strong> Comprometido. <strong>Pagado:</strong> Aportado al inicio.
                    </p>
                  </div>

                  <div className="capital-grid">
                    {[
                      { key: 'startup', label: 'Startup', desc: '100M / 1M' },
                      { key: 'pyme', label: 'PyME', desc: '500M / 50M' },
                      { key: 'grande', label: 'Grande', desc: '1.000M / 100M' },
                      { key: 'personalizado', label: 'Personalizado', desc: '...' },
                    ].map(p => (
                      <button 
                        key={p.key} 
                        type="button" 
                        className={`capital-btn ${capitalPreset === p.key ? 'active' : ''}`}
                        onClick={() => handleCapitalPreset(p.key)}
                      >
                        <div className="capital-label">{p.label}</div>
                        <div className="capital-desc">{p.desc}</div>
                      </button>
                    ))}
                  </div>

                  {capitalPreset === 'personalizado' && (
                    <div className="input-row-3">
                      <div>
                        <label className="label">Autorizado</label>
                        <input type="number" className="input" value={capitalAutorizado} onChange={(e) => setCapitalAutorizado(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Suscrito</label>
                        <input type="number" className="input" value={capitalSuscrito} onChange={(e) => setCapitalSuscrito(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Pagado</label>
                        <input type="number" className="input" value={capitalPagado} onChange={(e) => setCapitalPagado(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="btn-row">
                    <button type="button" className="btn-gray" onClick={() => setCurrentView('landing')}>← Volver</button>
                    <button type="button" className="btn-orange" onClick={nextStep}>Continuar →</button>
                  </div>
                </>
              )}

              {/* PASO 2 */}
              {currentStep === 2 && (
                <>
                  <h2 className="form-title">Accionistas</h2>
                  <p className="form-subtitle">Agrega personas naturales o jurídicas</p>

                  {accionistas.map((acc, index) => (
                    <div key={acc.id} className={`accionista-card ${acc.esGerente ? 'gerente' : ''}`}>
                      <div className="accionista-header">
                        <div className="accionista-title">
                          👤 Accionista {index + 1}
                          {acc.esGerente && <span className="badge badge-gerente">👔 Gerente</span>}
                        </div>
                        {accionistas.length > 1 && (
                          <button type="button" className="btn-remove" onClick={() => removeAccionista(index)}>✕ Eliminar</button>
                        )}
                      </div>

                      <div className="tipo-persona">
                        <button type="button" className={`tipo-btn ${acc.tipoPersona === 'natural' ? 'active' : ''}`} onClick={() => updateAccionista(index, 'tipoPersona', 'natural')}>
                          <div className="tipo-icon">👤</div>
                          <div className="tipo-label">Persona Natural</div>
                        </button>
                        <button type="button" className={`tipo-btn ${acc.tipoPersona === 'juridica' ? 'active' : ''}`} onClick={() => updateAccionista(index, 'tipoPersona', 'juridica')}>
                          <div className="tipo-icon">🏢</div>
                          <div className="tipo-label">Persona Jurídica</div>
                        </button>
                      </div>

                      {acc.tipoPersona === 'natural' ? (
                        <>
                          <div className="input-row">
                            <div>
                              <label className="label">Nombres y apellidos <span className="required">*</span></label>
                              <input type="text" className="input" value={acc.nombres} onChange={(e) => updateAccionista(index, 'nombres', e.target.value)} placeholder="Juan Carlos Pérez" />
                            </div>
                            <div>
                              <label className="label">Nacionalidad</label>
                              <input type="text" className="input" value={acc.nacionalidad} onChange={(e) => updateAccionista(index, 'nacionalidad', e.target.value)} />
                            </div>
                          </div>
                          <div className="input-row-3">
                            <div>
                              <label className="label">Tipo Doc</label>
                              <select className="input" value={acc.tipoDocumento} onChange={(e) => updateAccionista(index, 'tipoDocumento', e.target.value)}>
                                <option value="CC">Cédula</option>
                                <option value="CE">Cédula Extranjería</option>
                                <option value="PA">Pasaporte</option>
                              </select>
                            </div>
                            <div>
                              <label className="label">Número <span className="required">*</span></label>
                              <input type="text" className="input" value={acc.numeroDocumento} onChange={(e) => updateAccionista(index, 'numeroDocumento', e.target.value)} />
                            </div>
                            <div>
                              <label className="label">Expedido en</label>
                              <input type="text" className="input" value={acc.lugarExpedicion} onChange={(e) => updateAccionista(index, 'lugarExpedicion', e.target.value)} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="input-row">
                            <div>
                              <label className="label">Razón Social <span className="required">*</span></label>
                              <input type="text" className="input" value={acc.razonSocial} onChange={(e) => updateAccionista(index, 'razonSocial', e.target.value)} placeholder="INVERSIONES ABC S.A.S." />
                            </div>
                            <div>
                              <label className="label">NIT <span className="required">*</span></label>
                              <input type="text" className="input" value={acc.nit} onChange={(e) => updateAccionista(index, 'nit', e.target.value)} placeholder="900123456-7" />
                            </div>
                          </div>
                          <div className="rep-legal-box">
                            <div className="rep-legal-title">👔 Representante Legal</div>
                            <div className="input-row">
                              <div>
                                <label className="label">Nombres <span className="required">*</span></label>
                                <input type="text" className="input" value={acc.repLegalNombres} onChange={(e) => updateAccionista(index, 'repLegalNombres', e.target.value)} />
                              </div>
                              <div>
                                <label className="label">Cédula <span className="required">*</span></label>
                                <input type="text" className="input" value={acc.repLegalCedula} onChange={(e) => updateAccionista(index, 'repLegalCedula', e.target.value)} />
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="input-row">
                        <div>
                          <label className="label">Ciudad domicilio</label>
                          <input type="text" className="input" value={acc.ciudadDomicilio} onChange={(e) => updateAccionista(index, 'ciudadDomicilio', e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Dirección</label>
                          <input type="text" className="input" value={acc.direccionResidencia} onChange={(e) => updateAccionista(index, 'direccionResidencia', e.target.value)} />
                        </div>
                      </div>

                      <div className="input-row-3">
                        <div>
                          <label className="label">Email <span className="required">*</span></label>
                          <input type="email" className="input" value={acc.email} onChange={(e) => updateAccionista(index, 'email', e.target.value)} />
                        </div>
                        <div>
                          <label className="label">Teléfono</label>
                          <input type="tel" className="input" value={acc.telefono} onChange={(e) => updateAccionista(index, 'telefono', e.target.value)} />
                        </div>
                        <div>
                          <label className="label">% Participación <span className="required">*</span></label>
                          <input type="number" className="input" value={acc.porcentaje} onChange={(e) => updateAccionista(index, 'porcentaje', e.target.value)} min="0" max="100" />
                        </div>
                      </div>

                      <label className="checkbox-row">
                        <input type="checkbox" className="checkbox" checked={acc.esGerente} onChange={(e) => updateAccionista(index, 'esGerente', e.target.checked)} />
                        <span>Designar como Gerente (Representante Legal)</span>
                      </label>

                      <div>
                        <label className="label">{acc.tipoPersona === 'natural' ? 'Documento de identidad' : 'RUT o Certificado'}</label>
                        <div className={`upload-area ${uploadProgress[index] === 'done' ? 'done' : ''}`} onClick={() => document.getElementById(`file-${acc.id}`).click()}>
                          <input id={`file-${acc.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display: 'none'}} onChange={(e) => handleFileUpload(index, e.target.files[0])} />
                          {uploadProgress[index] === 'done' ? (
                            <span style={{color: '#22c55e', fontWeight: '600'}}>✓ {acc.documentoFileName}</span>
                          ) : (
                            <>
                              <div className="upload-icon">📄</div>
                              <div className="upload-text">Clic para subir (PDF, JPG, PNG)</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className={`porcentaje-bar ${totalPorcentaje === 100 ? 'ok' : 'warning'}`}>
                    <span>Total participación:</span>
                    <span className={`porcentaje-value ${totalPorcentaje === 100 ? 'ok' : 'warning'}`}>{totalPorcentaje}%</span>
                  </div>

                  <button type="button" className="btn-add" onClick={addAccionista}>+ Agregar accionista</button>

                  <div className="btn-row">
                    <button type="button" className="btn-gray" onClick={prevStep}>← Anterior</button>
                    <button type="button" className="btn-orange" onClick={nextStep}>Continuar →</button>
                  </div>
                </>
              )}

              {/* PASO 3 */}
              {currentStep === 3 && (
                <>
                  <h2 className="form-title">Confirma tu solicitud</h2>

                  <div className="summary-box">
                    <h3 className="summary-title">🏢 Empresa</h3>
                    <p><strong>Nombre:</strong> {nombreEmpresa} S.A.S.</p>
                    <p><strong>Objeto:</strong> {objetoSocial}</p>
                    <p><strong>Ciudad:</strong> {ciudadSociedad}</p>
                    <p><strong>Capital:</strong> {formatCurrency(capitalPagado)}</p>
                  </div>

                  <div className="summary-box">
                    <h3 className="summary-title">👥 Accionistas ({accionistas.length})</h3>
                    {accionistas.map((acc, i) => (
                      <div key={i} className={`summary-item ${acc.esGerente ? 'gerente' : ''}`}>
                        <div>
                          <strong>{acc.tipoPersona === 'natural' ? acc.nombres : acc.razonSocial}</strong>
                          <div style={{fontSize: '13px', color: '#666'}}>{acc.tipoPersona === 'natural' ? `${acc.tipoDocumento} ${acc.numeroDocumento}` : `NIT ${acc.nit}`}</div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontWeight: '700', color: '#D85A2D'}}>{acc.porcentaje}%</div>
                          {acc.esGerente && <div style={{fontSize: '12px', color: '#d97706'}}>👔 Gerente</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {tieneExtranjeros && (
                    <div className="alert-warning">
                      ⚠️ <strong>Hay accionistas extranjeros.</strong> Se requieren documentos adicionales.
                    </div>
                  )}

                  <label className="policy-check">
                    <input type="checkbox" className="policy-checkbox" checked={aceptaPolitica} onChange={(e) => setAceptaPolitica(e.target.checked)} />
                    <span style={{fontSize: '14px'}}>
                      Acepto la <a href="https://cdn.prod.website-files.com/68d59253eac398f3c33af169/69174eb3a1ff60c9541a18d2_Poli%CC%81tica%20de%20proteccio%CC%81n%20de%20Datos%20Due%20Legal%20(1).docx.pdf" target="_blank" rel="noopener noreferrer" className="policy-link">política de tratamiento de datos</a>
                    </span>
                  </label>

                  <div className="btn-row">
                    <button type="button" className="btn-gray" onClick={prevStep}>← Anterior</button>
                    <button type="button" className="btn-orange" onClick={handleSubmit} disabled={isSubmitting} style={{opacity: isSubmitting ? 0.7 : 1}}>
                      {isSubmitting ? '⏳ Enviando...' : '✓ Enviar solicitud'}
                    </button>
                  </div>
                </>
              )}

              {/* PASO 4 */}
              {currentStep === 4 && (
                <div className="success-card">
                  <div className="success-icon">✓</div>
                  <h2 style={{fontSize: '28px', color: '#232C54', marginBottom: '16px'}}>¡Solicitud enviada!</h2>
                  <p style={{color: '#666', marginBottom: '32px'}}>Un abogado revisará tu información pronto.</p>
                  <div className="tracking-display">
                    <div style={{opacity: 0.8, marginBottom: '8px'}}>Tu código de seguimiento:</div>
                    <div className="tracking-code">{trackingCode}</div>
                  </div>
                  <button className="btn-orange" onClick={() => { setCurrentView('landing'); setCurrentStep(1); }}>Volver al inicio</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRACKING */}
        {currentView === 'tracking' && (
          <div className="tracking-container">
            <div className="form-card">
              <h2 className="form-title">Consulta tu solicitud</h2>
              <p className="form-subtitle">Ingresa tu código de seguimiento</p>

              <form onSubmit={handleTrackingSubmit} className="tracking-form">
                <input type="text" name="codigo" className="tracking-input" placeholder="Ej: DL-ABC123" maxLength={10} />
                <button type="submit" className="btn-orange" disabled={trackingLoading}>
                  {trackingLoading ? '⏳' : '🔍'} Buscar
                </button>
              </form>

              {trackingError && <div className="error-box">❌ {trackingError}</div>}

              {trackingData && (
                <div className="tracking-result">
                  <div style={{textAlign: 'center', marginBottom: '24px'}}>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '8px'}}>Estado actual</div>
                    <span className="status-badge" style={{background: getStatusColor(trackingData.estado).bg, color: getStatusColor(trackingData.estado).text}}>{trackingData.estado}</span>
                  </div>
                  <div className="tracking-info">
                    <div className="tracking-row"><span style={{color: '#666'}}>Código:</span><strong>{trackingData.codigo}</strong></div>
                    <div className="tracking-row"><span style={{color: '#666'}}>Empresa:</span><strong>{trackingData.empresa}</strong></div>
                    {trackingData.nit && <div className="tracking-row"><span style={{color: '#666'}}>NIT:</span><strong>{trackingData.nit}</strong></div>}
                  </div>

                  {trackingData.estado === 'Constituida' && (
                    <div className="docs-box">
                      <div className="docs-title">🎉 ¡Tu empresa está constituida!</div>
                      {trackingData.certificadoUrl && (
                        <div className="doc-item">
                          <span>📜 Certificado de Existencia</span>
                          <a href={trackingData.certificadoUrl} target="_blank" rel="noopener noreferrer" className="doc-link">⬇ Descargar</a>
                        </div>
                      )}
                      {trackingData.rutUrl && (
                        <div className="doc-item">
                          <span>📋 RUT</span>
                          <a href={trackingData.rutUrl} target="_blank" rel="noopener noreferrer" className="doc-link">⬇ Descargar</a>
                        </div>
                      )}
                      {trackingData.estadosFinancierosUrl && (
                        <div className="doc-item">
                          <span>📊 Estados Financieros</span>
                          <a href={trackingData.estadosFinancierosUrl} target="_blank" rel="noopener noreferrer" className="doc-link">⬇ Descargar</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button type="button" className="btn-gray" style={{width: '100%', marginTop: '24px'}} onClick={() => setCurrentView('landing')}>← Volver al inicio</button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-logo">Due Legal</div>
          <p className="footer-text">Simplificamos el derecho para tu empresa</p>
          <div className="footer-copy">© 2026 Due Legal. Todos los derechos reservados.</div>
        </footer>
      </div>
    </>
  );
}
