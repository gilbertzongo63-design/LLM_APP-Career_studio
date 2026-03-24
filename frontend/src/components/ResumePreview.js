import React, { forwardRef } from 'react';
import './ResumePreview.css';

const ResumePreview = forwardRef(({ data, mode = 'desktop' }, ref) => {
  const getTemplateStyle = () => {
    const styles = {
      modern: 'modern-template',
      classic: 'classic-template',
      creative: 'creative-template',
      minimal: 'minimal-template',
      executive: 'executive-template',
      tech: 'tech-template'
    };
    return styles[data.template] || styles.modern;
  };

  const getColorStyle = () => {
    const colors = {
      blue: { primary: '#3498db', secondary: '#2980b9', light: '#ecf0f1' },
      green: { primary: '#27ae60', secondary: '#219653', light: '#d5f4e6' },
      purple: { primary: '#9b59b6', secondary: '#8e44ad', light: '#f4ecf7' },
      dark: { primary: '#2c3e50', secondary: '#1a252f', light: '#bdc3c7' },
      red: { primary: '#e74c3c', secondary: '#c0392b', light: '#fadbd8' },
      orange: { primary: '#e67e22', secondary: '#d35400', light: '#fdebd0' }
    };
    return colors[data.colorScheme] || colors.blue;
  };

  const templateClass = getTemplateStyle();
  const colors = getColorStyle();

  // Vérifier si skills est un tableau ou une chaîne
  const skillsArray = Array.isArray(data.skills) 
    ? data.skills 
    : (data.skills || '').split(',').map(s => s.trim()).filter(s => s);

  return (
    <div
      className={`resume-preview ${templateClass} ${mode}`}
      id="resume-preview"
      ref={ref}
      style={{ fontFamily: data.font || 'Arial, sans-serif' }}
    >
      <div className="resume-page">
        {/* En-tête */}
        <div className="resume-header" style={{ backgroundColor: colors.primary, color: '#ffffff' }}>
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {data.profilePhoto && (
                <div className="profile-photo-container" style={{ width: 80, height: 80, overflow: 'hidden', borderRadius: 8, background: '#fff' }}>
                  <img src={data.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <h1 style={{ fontFamily: data.font || 'Arial' }}>{data.fullName || 'Nom Prénom'}</h1>
            </div>
            <div className="header-subtitle">{data.title || 'Poste recherché'}</div>
            <div className="header-contact">
              {data.email && <span>📧 {data.email}</span>}
              {data.phone && <span>📱 {data.phone}</span>}
              {data.category && <span>🏷️ {data.category}</span>}
            </div>
          </div>
        </div>

        {/* Corps du CV */}
        <div className="resume-body">
          {/* Colonne gauche */}
          <div className="resume-left">
            {data.summary && (
              <section className="section">
                <h2 style={{ color: colors.primary }}>📝 Profil</h2>
                <p>{data.summary}</p>
              </section>
            )}

            {skillsArray.length > 0 && (
              <section className="section">
                <h2 style={{ color: colors.primary }}>🛠️ Compétences</h2>
                <div className="skills-list">
                  {skillsArray.map((skill, index) => (
                    <div key={index} className="skill-tag" style={{ backgroundColor: colors.light, color: colors.secondary }}>
                      {skill}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.education && (
              <section className="section">
                <h2 style={{ color: colors.primary }}>🎓 Formation</h2>
                <div className="content">{data.education}</div>
              </section>
            )}
          </div>

          {/* Colonne droite */}
          <div className="resume-right">
            {data.experience && (
              <section className="section">
                <h2 style={{ color: colors.primary }}>💼 Expérience</h2>
                <div className="content">{data.experience}</div>
              </section>
            )}

            {data.category && (
              <section className="section">
                <h2 style={{ color: colors.primary }}>🏢 Secteur</h2>
                <div className="category-badge" style={{ backgroundColor: colors.primary, color: '#ffffff' }}>
                  {data.category}
                </div>
              </section>
            )}

            {data.experience && (
              <section className="section">
                <h2 style={{ color: colors.primary }}>⏱️ Expérience</h2>
                <div className="experience-display">
                  <div className="experience-value" style={{ color: colors.primary }}>
                    {data.experience}
                  </div>
                  <div className="experience-label">d'expérience</div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Pied de page */}
        <div className="resume-footer" style={{ backgroundColor: colors.light }}>
          <div className="footer-content">
            <p>CV généré avec Createur de CV et de Lettre de Motivation • {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
