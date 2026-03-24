import React, { useState } from 'react';
import './TemplateSelector.css';

const TemplateSelector = ({
  selectedTemplate,
  selectedColor,
  selectedFont,
  onSelect,
  onNext,
  resumeData,
}) => {
  const templates = [
    { id: 'modern', name: 'Moderne', icon: '01', description: 'Design contemporain et epure' },
    { id: 'classic', name: 'Classique', icon: '02', description: 'Style traditionnel professionnel' },
    { id: 'creative', name: 'Creatif', icon: '03', description: 'Parfait pour les metiers creatifs' },
    { id: 'minimal', name: 'Minimaliste', icon: '04', description: 'Simple et efficace' },
    { id: 'executive', name: 'Cadre', icon: '05', description: 'Elegant pour postes senior' },
    { id: 'tech', name: 'Technique', icon: '06', description: 'Ideal pour developpeurs' },
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Bleu', color: '#3498db', textColor: '#ffffff' },
    { id: 'green', name: 'Vert', color: '#27ae60', textColor: '#ffffff' },
    { id: 'purple', name: 'Violet', color: '#9b59b6', textColor: '#ffffff' },
    { id: 'dark', name: 'Sombre', color: '#2c3e50', textColor: '#ffffff' },
    { id: 'red', name: 'Rouge', color: '#e74c3c', textColor: '#ffffff' },
    { id: 'orange', name: 'Orange', color: '#e67e22', textColor: '#ffffff' },
  ];

  const fonts = [
    { id: 'Arial', name: 'Arial', family: 'Arial, sans-serif' },
    { id: 'Georgia', name: 'Georgia', family: 'Georgia, serif' },
    { id: 'Helvetica', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
    { id: 'Times', name: 'Times New Roman', family: 'Times New Roman, serif' },
    { id: 'Calibri', name: 'Calibri', family: 'Calibri, sans-serif' },
    { id: 'Roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  ];

  const [activeTab, setActiveTab] = useState('templates');
  const [localTemplate, setLocalTemplate] = useState(selectedTemplate);
  const [localColor, setLocalColor] = useState(selectedColor);
  const [localFont, setLocalFont] = useState(selectedFont);

  const handleApply = () => {
    onSelect(localTemplate, localColor, localFont);
    if (onNext) onNext();
  };

  const selectedColorScheme =
    colorSchemes.find((c) => c.id === localColor) || colorSchemes[0];
  const selectedFontFamily =
    fonts.find((f) => f.id === localFont)?.family || 'Arial, sans-serif';

  return (
    <div className="template-selector">
      <div className="selector-container">
        <div className="selector-hero">
          <div>
            <p className="selector-kicker">Choix du design</p>
            <h2>Trouvez un modele qui donne du relief a votre CV</h2>
            <p className="selector-description">
              Comparez les styles, testez les couleurs et voyez le rendu avant d appliquer.
            </p>
          </div>
          <div className="selector-summary">
            <span>{templates.length} modeles</span>
            <span>{colorSchemes.length} couleurs</span>
            <span>{fonts.length} polices</span>
          </div>
        </div>

        <div className="selector-tabs">
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Modeles
          </button>
          <button
            className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Couleurs
          </button>
          <button
            className={`tab-btn ${activeTab === 'fonts' ? 'active' : ''}`}
            onClick={() => setActiveTab('fonts')}
          >
            Polices
          </button>
        </div>

        <div className="selector-content">
          {activeTab === 'templates' && (
            <div className="templates-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${localTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setLocalTemplate(template.id)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                  {localTemplate === template.id && <div className="selected-badge">OK</div>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="colors-grid">
              {colorSchemes.map((color) => (
                <div
                  key={color.id}
                  className={`color-card ${localColor === color.id ? 'selected' : ''}`}
                  onClick={() => setLocalColor(color.id)}
                >
                  <div className="color-preview" style={{ backgroundColor: color.color }} />
                  <div className="color-info">
                    <h4>{color.name}</h4>
                    <div className="color-code">{color.color}</div>
                  </div>
                  {localColor === color.id && <div className="selected-badge">OK</div>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="fonts-list">
              {fonts.map((font) => (
                <div
                  key={font.id}
                  className={`font-item ${localFont === font.id ? 'selected' : ''}`}
                  onClick={() => setLocalFont(font.id)}
                  style={{ fontFamily: font.family }}
                >
                  <div className="font-preview">
                    <div className="font-name">{font.name}</div>
                    <div className="font-sample">Aa Bb Cc 123</div>
                  </div>
                  {localFont === font.id && <div className="selected-badge">OK</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="preview-section">
          <div className="preview-heading">
            <div>
              <p className="preview-kicker">Simulation</p>
              <h3>Apercu en direct</h3>
            </div>
            <div className="preview-chip">{templates.find((t) => t.id === localTemplate)?.name}</div>
          </div>
          <div className={`live-preview template-preview-${localTemplate}`}>
            <div
              className={`preview-header preview-header-${localTemplate}`}
              style={{
                backgroundColor: selectedColorScheme.color,
                color: selectedColorScheme.textColor,
              }}
            >
              <div className="preview-title" style={{ fontFamily: selectedFontFamily }}>
                {resumeData.fullName || 'Votre nom'}
              </div>
              <div className="preview-subtitle">
                {resumeData.title || 'Titre du poste'}
              </div>
            </div>

            <div className={`preview-body preview-body-${localTemplate}`}>
              <div className="preview-block">
                <h4>Contact</h4>
                <p>{resumeData.email || 'email@exemple.com'}</p>
                <p>{resumeData.phone || '+33 1 23 45 67 89'}</p>
              </div>
              <div className="preview-block">
                <h4>Profil</h4>
                <p>{resumeData.summary || 'Resume professionnel...'}</p>
              </div>
              <div className="preview-block">
                <h4>Competences</h4>
                <p>Communication, Analyse, Gestion, Outils numeriques</p>
              </div>
            </div>
          </div>

          <div className="template-meta">
            <p><strong>Modele :</strong> {templates.find((t) => t.id === localTemplate)?.name}</p>
            <p><strong>Couleur :</strong> {selectedColorScheme.name}</p>
            <p><strong>Police :</strong> {fonts.find((f) => f.id === localFont)?.name}</p>
          </div>
        </div>

        <div className="selector-actions">
          <button
            className="btn-apply"
            onClick={handleApply}
            disabled={!localTemplate || !localColor || !localFont}
          >
            Appliquer ce design
          </button>
          <button
            className="btn-skip"
            onClick={() => {
              onSelect('modern', 'blue', 'Arial');
              if (onNext) onNext();
            }}
          >
            Passer cette etape
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
