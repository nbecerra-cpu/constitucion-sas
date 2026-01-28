'use client';

import { useState, useEffect } from 'react';

export default function ConstitucionSAS() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  
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
      nombres: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      lugarExpedicion: '',
      nacionalidad: 'Colombiana',
      ciudadDomicilio: '',
      email: '',
      telefono: '',
      porcentaje: 100,
      esGerente: true,
    }],
    tieneSuplente: false,
    suplente: { nombres: '', numeroDocumento: '' },
    aceptaTerminos: false,
  });

  const tieneExtranjeros = formData.accionistas.some(a => 
    a.nacionalidad.toLowerCase() !== 'colombiana' && a.nacionalidad !== ''
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

  const addAccionista = () => {
    const restante = Math.max(0, 100 - totalPorcentaje);
    setFormData(prev => ({
      ...prev,
      accionistas: [...prev.accionistas, {
        id: Date.now(),
        nombres: '',
        tipoDocumento: 'CC',
        numeroDocumento: '',
        lugarExpedicion: '',
        nacionalidad: 'Colombiana',
        ciudadDomicilio: '',
        email: '',
        telefono: '',
        porcentaje: restante,
        esGerente: false,
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
      pequeña: { autorizado: '500000000', suscrito: '10000000', pagado: '10000000' },
      mediana: { autorizado: '1000000000', suscrito: '50000000', pagado: '50000000' },
    };
    if (presets[preset]) {
      setFormData(prev => ({
        ...prev,
        capitalPreset: preset,
        capitalAutorizado: presets[preset].autorizado,
        capitalSuscrito: presets[preset].suscrito,
        capitalPagado: presets[preset].pagado,
      }));
    } else {
      setFormData(prev => ({ ...prev, capitalPreset: 'personalizado' }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const code = `DL-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    setTrackingCode(code);
    setIsSubmitting(false);
    setCurrentView('success');
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const formatMoney = (num) => {
    return parseInt(num || 0).toLocaleString('es-CO');
  };

  // LANDING
  if (currentView === 'landing') {
    return (
      <div style={styles.container}>
        <div style={styles.landing}>
          <div style={styles.hero}>
            <div style={styles.badge}>⚡ 100% Online · 48 horas</div>
            <h1 style={styles.heroTitle}>
              Constituye tu <span style={styles.highlight}>Sociedad (S.A.S.)</span>
            </h1>
            <p style={styles.heroText}>
              Completa el formulario y nosotros nos encargamos de todo. Un abogado de Due Legal te acompañará en cada paso.
            </p>
            
            <div style={styles.heroActions}>
              <button onClick={() => setCurrentView('form')} style={styles.btnPrimary}>
                Comenzar ahora →
              </button>
              <button 
                onClick={() => {
                  const code = prompt('Ingresa tu código de seguimiento:');
                  if (code) { setTrackingCode(code); setCurrentView('tracking'); }
                }}
                style={styles.btnOutlineWhite}
              >
                Ya inicié mi trámite
              </button>
            </div>
          </div>

          <div style={styles.process}>
            <div style={styles.processStep}>
              <span style={styles.processIcon}>📝</span>
              <h3>1. Completa el formulario</h3>
              <p>Solo 5 minutos</p>
            </div>
            <div style={styles.processArrow}>→</div>
            <div style={styles.processStep}>
              <span style={styles.processIcon}>👨‍⚖️</span>
              <h3>2. Te contactamos</h3>
              <p>Un abogado revisa todo</p>
            </div>
            <div style={styles.processArrow}>→</div>
            <div style={styles.processStep}>
              <span style={styles.processIcon}>🎉</span>
              <h3>3. ¡Listo!</h3>
              <p>Sociedad constituida</p>
            </div>
          </div>

          <div style={styles.priceSection}>
            <div style={styles.priceCard}>
              <div style={styles.priceLabel}>Todo incluido</div>
              <div style={styles.priceAmount}>$1.250.000</div>
              <div style={styles.priceCurrency}>COP</div>
              
              <ul style={styles.priceList}>
                <li>✓ Estatutos personalizados</li>
                <li>✓ Poderes de constitución</li>
                <li>✓ Radicación en Cámara de Comercio</li>
                <li>✓ Certificado de existencia</li>
                <li>✓ RUT de la sociedad</li>
                <li>✓ Estados financieros iniciales</li>
                <li>✓ Acompañamiento de abogado</li>
              </ul>

              <p style={styles.priceNote}>
                * Precio para accionistas colombianos. Si hay accionistas extranjeros, 
                un agente de Due Legal te contactará con cotización personalizada.
              </p>

              <button onClick={() => setCurrentView('form')} style={styles.btnPrimary}>
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORMULARIO
  if (currentView === 'form') {
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <button onClick={() => setCurrentView('landing')} style={styles.backBtn}>
              ← Volver
            </button>
            <div style={styles.progressInfo}>
              <span>Paso {currentStep} de 4</span>
              <div style={styles.progressBar}>
                <div style={{...styles.progressFill, width: `${(currentStep / 4) * 100}%`}} />
              </div>
            </div>
          </div>

          <div style={styles.stepsNav}>
            {['Tu empresa', 'Socios', 'Capital', 'Confirmar'].map((label, i) => (
              <div 
                key={i}
                style={{
                  ...styles.stepTab,
                  ...(currentStep === i + 1 ? styles.stepTabActive : {}),
                  ...(currentStep > i + 1 ? styles.stepTabDone : {}),
                }}
              >
                <span style={styles.stepNum}>{currentStep > i + 1 ? '✓' : i + 1}</span>
                <span style={styles.stepLabel}>{label}</span>
              </div>
            ))}
          </div>

          <div style={styles.formCard}>
            
            {/* PASO 1 */}
            {currentStep === 1 && (
              <div style={styles.stepContent}>
                <div style={styles.stepHeader}>
                  <span style={styles.emoji}>🏢</span>
                  <h2 style={styles.stepTitle}>Datos de tu empresa</h2>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Nombre de la sociedad</label>
                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      name="nombreEmpresa"
                      value={formData.nombreEmpresa}
                      onChange={handleInputChange}
                      placeholder="Mi Empresa Increíble"
                      style={styles.inputLarge}
                    />
                    <span style={styles.inputAddon}>S.A.S.</span>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>¿A qué se dedicará?</label>
                  <textarea
                    name="objetoSocial"
                    value={formData.objetoSocial}
                    onChange={handleInputChange}
                    placeholder="Describe las actividades principales..."
                    style={styles.textarea}
                    rows={3}
                  />
                  <div style={styles.chips}>
                    {['Software y tecnología', 'Comercio', 'Consultoría', 'Marketing'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          objetoSocial: prev.objetoSocial ? prev.objetoSocial + '. ' + s : s
                        }))}
                        style={styles.chip}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.fieldRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Ciudad</label>
                    <select
                      name="ciudadSociedad"
                      value={formData.ciudadSociedad}
                      onChange={handleInputChange}
                      style={styles.select}
                    >
                      <option>Bogotá D.C.</option>
                      <option>Medellín</option>
                      <option>Cali</option>
                      <option>Barranquilla</option>
                      <option>Cartagena</option>
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Teléfono</label>
                    <input
                      type="tel"
                      name="telefonoSociedad"
                      value={formData.telefonoSociedad}
                      onChange={handleInputChange}
                      placeholder="300 123 4567"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Dirección</label>
                  <input
                    type="text"
                    name="direccionSociedad"
                    value={formData.direccionSociedad}
                    onChange={handleInputChange}
                    placeholder="Cra 7 #116-50, Of. 801"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email corporativo</label>
                  <input
                    type="email"
                    name="emailSociedad"
                    value={formData.emailSociedad}
                    onChange={handleInputChange}
                    placeholder="contacto@tuempresa.com"
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            {/* PASO 2 */}
            {currentStep === 2 && (
              <div style={styles.stepContent}>
                <div style={styles.stepHeader}>
                  <span style={styles.emoji}>👥</span>
                  <h2 style={styles.stepTitle}>¿Quiénes serán los socios?</h2>
                </div>

                <div style={{
                  ...styles.percentBar,
                  borderColor: totalPorcentaje === 100 ? '#28a745' : totalPorcentaje > 100 ? '#dc3545' : '#ddd'
                }}>
                  <div style={styles.percentLabel}>
                    Total: <strong>{totalPorcentaje}%</strong>
                    {totalPorcentaje !== 100 && <span style={{color: '#dc3545'}}> (debe ser 100%)</span>}
                  </div>
                  <div style={styles.percentTrack}>
                    <div style={{
                      ...styles.percentFill,
                      width: `${Math.min(totalPorcentaje, 100)}%`,
                      background: totalPorcentaje === 100 ? '#28a745' : totalPorcentaje > 100 ? '#dc3545' : '#D85A2D'
                    }} />
                  </div>
                </div>

                {formData.accionistas.map((acc, index) => (
                  <div key={acc.id} style={styles.socioCard}>
                    <div style={styles.socioHeader}>
                      <span style={styles.socioNum}>Socio {index + 1}</span>
                      {acc.esGerente && <span style={styles.gerenteBadge}>👔 Gerente</span>}
                      {formData.accionistas.length > 1 && (
                        <button onClick={() => removeAccionista(index)} style={styles.removeBtn}>✕</button>
                      )}
                    </div>

                    <div style={styles.socioFields}>
                      <div style={styles.fieldRow}>
                        <div style={{...styles.field, flex: 2}}>
                          <label style={styles.labelSmall}>Nombre completo</label>
                          <input
                            type="text"
                            value={acc.nombres}
                            onChange={(e) => handleAccionistaChange(index, 'nombres', e.target.value)}
                            placeholder="Juan Carlos Pérez"
                            style={styles.input}
                          />
                        </div>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Participación</label>
                          <div style={styles.inputGroup}>
                            <input
                              type="number"
                              value={acc.porcentaje}
                              onChange={(e) => handleAccionistaChange(index, 'porcentaje', parseFloat(e.target.value) || 0)}
                              style={{...styles.input, textAlign: 'right'}}
                              min="0"
                              max="100"
                            />
                            <span style={styles.inputAddon}>%</span>
                          </div>
                        </div>
                      </div>

                      <div style={styles.fieldRow}>
                        <div style={{...styles.field, width: '100px'}}>
                          <label style={styles.labelSmall}>Doc</label>
                          <select
                            value={acc.tipoDocumento}
                            onChange={(e) => handleAccionistaChange(index, 'tipoDocumento', e.target.value)}
                            style={styles.select}
                          >
                            <option value="CC">C.C.</option>
                            <option value="CE">C.E.</option>
                            <option value="PA">Pasaporte</option>
                          </select>
                        </div>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Número</label>
                          <input
                            type="text"
                            value={acc.numeroDocumento}
                            onChange={(e) => handleAccionistaChange(index, 'numeroDocumento', e.target.value)}
                            placeholder="1.234.567.890"
                            style={styles.input}
                          />
                        </div>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Expedido en</label>
                          <input
                            type="text"
                            value={acc.lugarExpedicion}
                            onChange={(e) => handleAccionistaChange(index, 'lugarExpedicion', e.target.value)}
                            placeholder="Bogotá"
                            style={styles.input}
                          />
                        </div>
                      </div>

                      <div style={styles.fieldRow}>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Nacionalidad</label>
                          <input
                            type="text"
                            value={acc.nacionalidad}
                            onChange={(e) => handleAccionistaChange(index, 'nacionalidad', e.target.value)}
                            placeholder="Colombiana"
                            style={styles.input}
                          />
                        </div>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Ciudad residencia</label>
                          <input
                            type="text"
                            value={acc.ciudadDomicilio}
                            onChange={(e) => handleAccionistaChange(index, 'ciudadDomicilio', e.target.value)}
                            placeholder="Bogotá D.C."
                            style={styles.input}
                          />
                        </div>
                      </div>

                      <div style={styles.fieldRow}>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Email</label>
                          <input
                            type="email"
                            value={acc.email}
                            onChange={(e) => handleAccionistaChange(index, 'email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            style={styles.input}
                          />
                        </div>
                        <div style={{...styles.field, flex: 1}}>
                          <label style={styles.labelSmall}>Celular</label>
                          <input
                            type="tel"
                            value={acc.telefono}
                            onChange={(e) => handleAccionistaChange(index, 'telefono', e.target.value)}
                            placeholder="300 123 4567"
                            style={styles.input}
                          />
                        </div>
                      </div>

                      <label style={styles.checkLabel}>
                        <input
                          type="checkbox"
                          checked={acc.esGerente}
                          onChange={(e) => handleAccionistaChange(index, 'esGerente', e.target.checked)}
                          style={styles.checkbox}
                        />
                        Este socio será el <strong>Gerente</strong> (Representante Legal)
                      </label>
                    </div>
                  </div>
                ))}

                <button onClick={addAccionista} style={styles.addBtn}>
                  + Agregar otro socio
                </button>
              </div>
            )}

            {/* PASO 3 */}
            {currentStep === 3 && (
              <div style={styles.stepContent}>
                <div style={styles.stepHeader}>
                  <span style={styles.emoji}>💰</span>
                  <h2 style={styles.stepTitle}>Capital de la sociedad</h2>
                </div>

                <p style={styles.hint}>
                  Selecciona una opción o personaliza los montos. Podrás aumentar el capital después.
                </p>

                <div style={styles.capitalOptions}>
                  {[
                    { key: 'startup', label: 'Startup', desc: '$1M suscrito' },
                    { key: 'pequeña', label: 'Pequeña', desc: '$10M suscrito' },
                    { key: 'mediana', label: 'Mediana', desc: '$50M suscrito' },
                    { key: 'personalizado', label: 'Otro', desc: 'Personalizar' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleCapitalPreset(opt.key)}
                      style={{
                        ...styles.capitalBtn,
                        ...(formData.capitalPreset === opt.key ? styles.capitalBtnActive : {})
                      }}
                    >
                      <span style={styles.capitalLabel}>{opt.label}</span>
                      <span style={styles.capitalDesc}>{opt.desc}</span>
                    </button>
                  ))}
                </div>

                <div style={styles.capitalFields}>
                  <div style={styles.capitalField}>
                    <label style={styles.labelSmall}>Capital Autorizado</label>
                    <div style={styles.moneyInput}>
                      <span style={styles.moneyPrefix}>$</span>
                      <input
                        type="text"
                        value={formatMoney(formData.capitalAutorizado)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          capitalPreset: 'personalizado',
                          capitalAutorizado: e.target.value.replace(/\D/g, '')
                        }))}
                        style={styles.inputMoney}
                      />
                    </div>
                  </div>
                  <div style={styles.capitalField}>
                    <label style={styles.labelSmall}>Capital Suscrito</label>
                    <div style={styles.moneyInput}>
                      <span style={styles.moneyPrefix}>$</span>
                      <input
                        type="text"
                        value={formatMoney(formData.capitalSuscrito)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          capitalPreset: 'personalizado',
                          capitalSuscrito: e.target.value.replace(/\D/g, '')
                        }))}
                        style={styles.inputMoney}
                      />
                    </div>
                  </div>
                  <div style={styles.capitalField}>
                    <label style={styles.labelSmall}>Capital Pagado</label>
                    <div style={styles.moneyInput}>
                      <span style={styles.moneyPrefix}>$</span>
                      <input
                        type="text"
                        value={formatMoney(formData.capitalPagado)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          capitalPreset: 'personalizado',
                          capitalPagado: e.target.value.replace(/\D/g, '')
                        }))}
                        style={styles.inputMoney}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.tipBox}>
                  💡 <strong>Tip:</strong> Para startups, $1.000.000 de capital pagado es suficiente para iniciar.
                </div>
              </div>
            )}

            {/* PASO 4 */}
            {currentStep === 4 && (
              <div style={styles.stepContent}>
                <div style={styles.stepHeader}>
                  <span style={styles.emoji}>✅</span>
                  <h2 style={styles.stepTitle}>Confirma tu solicitud</h2>
                </div>

                <div style={styles.summary}>
                  <div style={styles.summarySection}>
                    <h4>📋 Tu empresa</h4>
                    <div style={styles.summaryRow}>
                      <span>Nombre:</span>
                      <strong>{formData.nombreEmpresa || '---'} S.A.S.</strong>
                    </div>
                    <div style={styles.summaryRow}>
                      <span>Ciudad:</span>
                      <strong>{formData.ciudadSociedad}</strong>
                    </div>
                    <div style={styles.summaryRow}>
                      <span>Capital suscrito:</span>
                      <strong>${formatMoney(formData.capitalSuscrito)} COP</strong>
                    </div>
                  </div>

                  <div style={styles.summarySection}>
                    <h4>👥 Socios ({formData.accionistas.length})</h4>
                    {formData.accionistas.map((acc, i) => (
                      <div key={i} style={styles.summaryRow}>
                        <span>
                          {acc.nombres || `Socio ${i+1}`}
                          {acc.esGerente && <span style={styles.miniTag}>Gerente</span>}
                        </span>
                        <strong>{acc.porcentaje}%</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.priceBox}>
                  {tieneExtranjeros ? (
                    <div style={styles.foreignAlert}>
                      <span style={styles.foreignIcon}>🌍</span>
                      <div>
                        <strong>Socios extranjeros detectados</strong>
                        <p>Un agente de Due Legal te contactará con cotización personalizada.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.priceRow}>
                      <span>Constitución SAS (Todo incluido)</span>
                      <strong style={styles.priceFinal}>$1.250.000 COP</strong>
                    </div>
                  )}
                </div>

                <div style={styles.nextStepBox}>
                  <span style={styles.nextStepIcon}>👨‍⚖️</span>
                  <div>
                    <strong>¿Qué sigue?</strong>
                    <p>Al enviar, un abogado de Due Legal revisará tu información y te contactará en las próximas 24 horas para confirmar detalles y coordinar el pago.</p>
                  </div>
                </div>

                <div style={styles.termsBox}>
                  <label style={styles.checkLabel}>
                    <input
                      type="checkbox"
                      name="aceptaTerminos"
                      checked={formData.aceptaTerminos}
                      onChange={handleInputChange}
                      style={styles.checkbox}
                    />
                    Acepto los <a href="https://www.due-legal.com/terminos" target="_blank" style={styles.link}>términos y condiciones</a> y 
                    la <a href="https://www.due-legal.com/privacidad" target="_blank" style={styles.link}>política de privacidad</a>
                  </label>
                </div>
              </div>
            )}

            <div style={styles.formNav}>
              {currentStep > 1 && (
                <button onClick={prevStep} style={styles.btnOutline}>
                  ← Anterior
                </button>
              )}
              <div style={{flex: 1}} />
              {currentStep < 4 ? (
                <button onClick={nextStep} style={styles.btnPrimary}>
                  Continuar →
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.aceptaTerminos}
                  style={{
                    ...styles.btnPrimary,
                    ...(isSubmitting || !formData.aceptaTerminos ? styles.btnDisabled : {})
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar solicitud →'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS
  if (currentView === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>🎉</div>
            <h2 style={styles.successTitle}>¡Solicitud enviada!</h2>
            <p style={styles.successText}>
              Hemos recibido tu información. <strong>Un abogado de Due Legal te contactará en las próximas 24 horas</strong> para revisar los detalles.
            </p>

            <div style={styles.codeBox}>
              <span style={styles.codeLabel}>Tu código de seguimiento:</span>
              <span style={styles.codeValue}>{trackingCode}</span>
              <span style={styles.codeHint}>Guárdalo para consultar el estado</span>
            </div>

            <div style={styles.nextSteps}>
              <h4>📋 Próximos pasos</h4>
              <ol>
                <li>Un abogado te contactará para confirmar</li>
                <li>Te enviaremos los documentos para firma</li>
                <li>Radicamos en Cámara de Comercio</li>
                <li>¡Recibes tu sociedad constituida!</li>
              </ol>
            </div>

            <div style={styles.successActions}>
              <button onClick={() => setCurrentView('landing')} style={styles.btnOutline}>
                Volver al inicio
              </button>
              <button onClick={() => setCurrentView('tracking')} style={styles.btnPrimary}>
                Ver estado
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TRACKING
  if (currentView === 'tracking') {
    return (
      <div style={styles.container}>
        <div style={styles.trackingContainer}>
          <button onClick={() => setCurrentView('landing')} style={styles.backBtn}>
            ← Volver
          </button>

          <div style={styles.trackingCard}>
            <div style={styles.trackingHeader}>
              <span style={styles.trackingBadge}>📋 Seguimiento</span>
              <h2>{formData.nombreEmpresa || 'Tu empresa'} S.A.S.</h2>
              <p>Código: {trackingCode}</p>
            </div>

            <div style={styles.timeline}>
              {[
                { icon: '📝', title: 'Solicitud recibida', desc: 'Revisando información', done: true },
                { icon: '👨‍⚖️', title: 'Contacto del abogado', desc: 'Te llamaremos pronto', done: false },
                { icon: '📄', title: 'Documentos generados', desc: 'Estatutos y poderes', done: false },
                { icon: '🏛️', title: 'Radicado en Cámara', desc: 'En proceso', done: false },
                { icon: '🎉', title: '¡Constituida!', desc: 'Lista para operar', done: false },
              ].map((step, i) => (
                <div key={i} style={{...styles.timelineItem, opacity: step.done ? 1 : 0.4}}>
                  <div style={{
                    ...styles.timelineDot,
                    background: step.done ? '#28a745' : '#ddd',
                    color: step.done ? '#fff' : '#666'
                  }}>
                    {step.done ? '✓' : step.icon}
                  </div>
                  <div>
                    <strong>{step.title}</strong>
                    <p style={styles.timelineDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.contactInfo}>
              ¿Preguntas? <a href="mailto:info@due-legal.com" style={styles.link}>info@due-legal.com</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#f8f9fc',
    minHeight: '100vh',
    color: '#1a1a2e',
  },
  landing: {},
  hero: {
    textAlign: 'center',
    padding: '50px 24px',
    background: 'linear-gradient(135deg, #232C54 0%, #1a1f3d 100%)',
    color: '#fff',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(216, 90, 45, 0.2)',
    color: '#ff8c5a',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: 'clamp(26px, 5vw, 40px)',
    fontWeight: '800',
    marginBottom: '16px',
    lineHeight: '1.2',
  },
  highlight: { color: '#D85A2D' },
  heroText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    maxWidth: '500px',
    margin: '0 auto 28px',
    lineHeight: '1.6',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  process: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '50px 24px',
    background: '#fff',
    flexWrap: 'wrap',
  },
  processStep: { textAlign: 'center', maxWidth: '180px' },
  processIcon: { fontSize: '36px', display: 'block', marginBottom: '10px' },
  processArrow: { fontSize: '24px', color: '#D85A2D', fontWeight: 'bold' },
  priceSection: {
    padding: '50px 24px',
    display: 'flex',
    justifyContent: 'center',
  },
  priceCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 32px',
    textAlign: 'center',
    maxWidth: '380px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  },
  priceLabel: {
    background: '#D85A2D',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'inline-block',
    marginBottom: '16px',
  },
  priceAmount: { fontSize: '44px', fontWeight: '800', color: '#232C54' },
  priceCurrency: { fontSize: '16px', color: '#666', marginBottom: '20px' },
  priceList: {
    listStyle: 'none',
    textAlign: 'left',
    fontSize: '14px',
    lineHeight: '2',
    marginBottom: '20px',
    padding: '0',
  },
  priceNote: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '20px',
    fontStyle: 'italic',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: '#D85A2D',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'transparent',
    color: '#232C54',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnOutlineWhite: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'transparent',
    color: '#fff',
    border: '2px solid rgba(255,255,255,0.5)',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  formContainer: { maxWidth: '680px', margin: '0 auto', padding: '20px' },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    cursor: 'pointer',
  },
  progressInfo: { flex: 1 },
  progressBar: {
    height: '6px',
    background: '#e0e4ec',
    borderRadius: '3px',
    marginTop: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#D85A2D',
    borderRadius: '3px',
    transition: 'width 0.3s',
  },
  stepsNav: { display: 'flex', gap: '8px', marginBottom: '20px' },
  stepTab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#fff',
    borderRadius: '10px',
    opacity: 0.5,
  },
  stepTabActive: { opacity: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  stepTabDone: { opacity: 1 },
  stepNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#e0e4ec',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
  },
  stepLabel: { fontSize: '12px', fontWeight: '500' },
  formCard: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  stepContent: { padding: '28px' },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  emoji: { fontSize: '28px' },
  stepTitle: { fontSize: '20px', fontWeight: '700', color: '#232C54' },
  field: { marginBottom: '18px' },
  fieldRow: { display: 'flex', gap: '12px', marginBottom: '12px' },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  labelSmall: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e0e4ec',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  inputLarge: {
    flex: 1,
    padding: '14px 16px',
    border: '2px solid #e0e4ec',
    borderRadius: '8px 0 0 8px',
    fontSize: '16px',
    fontWeight: '600',
    outline: 'none',
  },
  inputGroup: { display: 'flex' },
  inputAddon: {
    padding: '12px 14px',
    background: '#f0f2f5',
    border: '2px solid #e0e4ec',
    borderLeft: 'none',
    borderRadius: '0 8px 8px 0',
    fontSize: '14px',
    color: '#666',
    fontWeight: '600',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e0e4ec',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e0e4ec',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '80px',
    outline: 'none',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
  chip: {
    padding: '6px 12px',
    background: '#f0f2f5',
    border: 'none',
    borderRadius: '16px',
    fontSize: '12px',
    color: '#666',
    cursor: 'pointer',
  },
  hint: { fontSize: '14px', color: '#888', marginBottom: '20px' },
  percentBar: {
    padding: '14px 16px',
    background: '#f8f9fc',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #ddd',
  },
  percentLabel: { fontSize: '13px', marginBottom: '8px' },
  percentTrack: {
    height: '8px',
    background: '#e0e4ec',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  percentFill: { height: '100%', borderRadius: '4px', transition: 'all 0.3s' },
  socioCard: {
    background: '#f8f9fc',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '14px',
    border: '2px solid #e0e4ec',
  },
  socioHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  socioNum: { fontSize: '14px', fontWeight: '700', color: '#232C54' },
  gerenteBadge: {
    background: '#232C54',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
  },
  removeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#dc3545',
    fontSize: '18px',
    cursor: 'pointer',
  },
  socioFields: {},
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '12px',
  },
  checkbox: { width: '18px', height: '18px', accentColor: '#D85A2D' },
  addBtn: {
    width: '100%',
    padding: '14px',
    background: 'transparent',
    border: '2px dashed #D85A2D',
    borderRadius: '10px',
    color: '#D85A2D',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  capitalOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '24px',
  },
  capitalBtn: {
    padding: '14px 10px',
    background: '#f8f9fc',
    border: '2px solid #e0e4ec',
    borderRadius: '10px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  capitalBtnActive: {
    borderColor: '#D85A2D',
    background: 'rgba(216, 90, 45, 0.05)',
  },
  capitalLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#232C54',
  },
  capitalDesc: {
    display: 'block',
    fontSize: '11px',
    color: '#888',
    marginTop: '2px',
  },
  capitalFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginBottom: '20px',
  },
  capitalField: { textAlign: 'center' },
  moneyInput: { display: 'flex', alignItems: 'center' },
  moneyPrefix: {
    padding: '12px',
    background: '#f0f2f5',
    border: '2px solid #e0e4ec',
    borderRight: 'none',
    borderRadius: '8px 0 0 8px',
    fontSize: '14px',
    color: '#666',
  },
  inputMoney: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e0e4ec',
    borderRadius: '0 8px 8px 0',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'right',
    outline: 'none',
  },
  tipBox: {
    padding: '14px 16px',
    background: 'rgba(141, 181, 211, 0.15)',
    borderRadius: '10px',
    fontSize: '13px',
  },
  summary: { marginBottom: '20px' },
  summarySection: {
    background: '#f8f9fc',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '12px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e0e4ec',
    fontSize: '13px',
  },
  miniTag: {
    background: '#232C54',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    marginLeft: '6px',
  },
  priceBox: {
    background: '#232C54',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '18px',
    color: '#fff',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  priceFinal: { fontSize: '20px', color: '#D85A2D' },
  foreignAlert: { display: 'flex', gap: '12px' },
  foreignIcon: { fontSize: '24px' },
  nextStepBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: 'rgba(216, 90, 45, 0.08)',
    borderRadius: '10px',
    marginBottom: '18px',
    fontSize: '13px',
  },
  nextStepIcon: { fontSize: '24px' },
  termsBox: { paddingTop: '16px', borderTop: '2px solid #e0e4ec' },
  link: { color: '#D85A2D' },
  formNav: {
    display: 'flex',
    padding: '18px 28px',
    borderTop: '1px solid #e0e4ec',
    background: '#fafbfc',
  },
  successContainer: {
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  successCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 32px',
    maxWidth: '450px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
  },
  successIcon: { fontSize: '56px', marginBottom: '16px' },
  successTitle: { fontSize: '24px', fontWeight: '700', marginBottom: '12px' },
  successText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  codeBox: {
    background: '#f8f9fc',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '24px',
  },
  codeLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '6px',
  },
  codeValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: '700',
    color: '#D85A2D',
    letterSpacing: '2px',
  },
  codeHint: {
    display: 'block',
    fontSize: '11px',
    color: '#888',
    marginTop: '6px',
  },
  nextSteps: {
    textAlign: 'left',
    background: '#f8f9fc',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '24px',
    fontSize: '13px',
  },
  successActions: { display: 'flex', gap: '12px', justifyContent: 'center' },
  trackingContainer: { padding: '20px', maxWidth: '550px', margin: '0 auto' },
  trackingCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  trackingHeader: { textAlign: 'center', marginBottom: '28px' },
  trackingBadge: {
    display: 'inline-block',
    background: 'rgba(216, 90, 45, 0.1)',
    color: '#D85A2D',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  timeline: { marginBottom: '24px' },
  timelineItem: { display: 'flex', gap: '14px', padding: '14px 0' },
  timelineDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  timelineDesc: { fontSize: '12px', color: '#888', margin: '2px 0 0' },
  contactInfo: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#666',
    paddingTop: '16px',
    borderTop: '1px solid #eee',
  },
};
