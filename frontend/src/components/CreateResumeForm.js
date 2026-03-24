import React, { useState } from 'react';
import PdfExportService from '../utils/PdfExportService';
import './CreateResumeForm.css';

const CreateResumeForm = ({ onSave, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    summary: initialData.summary || '',
    experience: initialData.experience || '',
    education: initialData.education || '',
    skills: initialData.skills || '',
    profilePhoto: initialData.profilePhoto || null,
    city: initialData.city || '',
    linkedin: initialData.linkedin || '',
    github: initialData.github || '',
    portfolio: initialData.portfolio || '',
    hasLinkedin: Boolean(initialData.linkedin),
    hasGithub: Boolean(initialData.github),
    hasPortfolio: Boolean(initialData.portfolio),
    projects: initialData.projects || '',
    certifications: initialData.certifications || '',
    languages: initialData.languages || '',
    interests: initialData.interests || '',
    category: initialData.category || 'HR',
    template: initialData.template || 'modern',
    colorScheme: initialData.colorScheme || 'blue',
    font: initialData.font || 'Arial',
  });

  const [savedResumes, setSavedResumes] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleLink = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
      ...(name === 'hasLinkedin' && !checked ? { linkedin: '' } : {}),
      ...(name === 'hasGithub' && !checked ? { github: '' } : {}),
      ...(name === 'hasPortfolio' && !checked ? { portfolio: '' } : {}),
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map((skill) => skill.trim());
    setFormData((prev) => ({
      ...prev,
      skills: skills.join(', '),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const loadSavedResumes = () => {
    const saved = JSON.parse(localStorage.getItem('resumes') || '[]');
    setSavedResumes(saved.reverse());
  };

  React.useEffect(() => {
    loadSavedResumes();
    try {
      const toEdit = JSON.parse(localStorage.getItem('resumeToEdit') || 'null');
      if (toEdit) {
        setFormData((prev) => ({ ...prev, ...toEdit }));
        localStorage.removeItem('resumeToEdit');
        setShowForm(true);
      }
    } catch (err) {
      console.error('Unable to load saved resume for editing', err);
    }
  }, []);

  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialData,
      template: initialData.template || prev.template || 'modern',
      colorScheme: initialData.colorScheme || prev.colorScheme || 'blue',
      font: initialData.font || prev.font || 'Arial',
    }));
  }, [initialData]);

  const handleLoadSaved = (resume) => {
    setFormData((prev) => ({ ...prev, ...resume }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSaved = (id) => {
    if (!window.confirm('Supprimer ce CV sauvegarde ?')) return;
    const stored = JSON.parse(localStorage.getItem('resumes') || '[]');
    const filtered = stored.filter((item) => String(item.id) !== String(id));
    localStorage.setItem('resumes', JSON.stringify(filtered));
    setSavedResumes(filtered.reverse());
  };

  const handleExportPdf = async () => {
    if (!formData.title || !formData.fullName || !formData.email || !formData.summary) {
      alert('Veuillez remplir les champs obligatoires : titre du CV, nom complet, email et resume avant d exporter.');
      return;
    }

    try {
      const filename = `${formData.fullName || formData.title || 'cv'}.pdf`;
      await PdfExportService.generateFromData(formData, {
        filename,
        template: formData.template || 'modern',
      });
      alert('Export PDF telecharge.');
    } catch (err) {
      console.error(err);
      alert(`Erreur lors de l export PDF : ${err.message || err}`);
    }
  };

  const handleExportDocx = async () => {
    try {
      const temp = document.createElement('div');
      temp.innerHTML = `
        <div class="cv-docx">
          <h1>${formData.fullName || ''}</h1>
          <h2>${formData.title || ''}</h2>
          <p>${formData.summary || ''}</p>
          <h3>Experience</h3>
          <div>${formData.experience || ''}</div>
          <h3>Formation</h3>
          <div>${formData.education || ''}</div>
          <h3>Competences</h3>
          <div>${formData.skills || ''}</div>
        </div>
      `;
      document.body.appendChild(temp);
      await PdfExportService.exportToDOCX(temp, {
        filename: `${formData.fullName || formData.title || 'cv'}.doc`,
        resumeData: formData,
        template: formData.template || 'modern',
        colorScheme: formData.colorScheme || 'blue',
        font: formData.font || 'Arial',
      });
      document.body.removeChild(temp);
      alert('Export DOC telecharge.');
    } catch (err) {
      console.error(err);
      alert(`Erreur lors de l export DOC : ${err.message || err}`);
    }
  };

  const isResumeExportValid = Boolean(
    formData.title && formData.fullName && formData.email && formData.summary
  );

  const filteredSavedResumes = savedResumes.filter((resume) => {
    const text = filterText.trim().toLowerCase();
    if (filterCategory !== 'all' && resume.category !== filterCategory) return false;
    if (!text) return true;
    return (
      (resume.fullName || resume.title || '').toLowerCase().includes(text) ||
      (resume.skills || '').toString().toLowerCase().includes(text)
    );
  });

  return (
    <div className="create-resume-form">
      <h2>{initialData.title ? 'Modifier le CV' : 'Creer un nouveau CV'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titre du CV *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex : CV Developpeur Frontend"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nom complet *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Categorie *</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="HR">RH</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Ventes</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Telephone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ville, Pays</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Paris, France"
            />
          </div>
          <div className="form-group">
            <label>Liens (LinkedIn / GitHub / Portfolio)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  name="hasLinkedin"
                  checked={!!formData.hasLinkedin}
                  onChange={handleToggleLink}
                />
                Oui
              </label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                disabled={!formData.hasLinkedin}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  name="hasGithub"
                  checked={!!formData.hasGithub}
                  onChange={handleToggleLink}
                />
                Oui
              </label>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
                disabled={!formData.hasGithub}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  name="hasPortfolio"
                  checked={!!formData.hasPortfolio}
                  onChange={handleToggleLink}
                />
                Oui
              </label>
              <input
                type="text"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://votre-portfolio.com"
                disabled={!formData.hasPortfolio}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Resume / Profil *</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="3"
            placeholder="Decrivez-vous en quelques lignes..."
            required
          />
        </div>

        <div className="form-group">
          <label>Experience professionnelle</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            rows="5"
            placeholder={`- Poste 1 - Entreprise (Dates)
- Poste 2 - Entreprise (Dates)`}
          />
        </div>

        <div className="form-group">
          <label>Formation</label>
          <textarea
            name="education"
            value={formData.education}
            onChange={handleChange}
            rows="4"
            placeholder={`- Diplome - Ecole (Annees)
- Certification - Organisme (Annee)`}
          />
        </div>

        <div className="form-group">
          <label>Competences (separees par des virgules)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleSkillsChange}
            placeholder="React, Node.js, UX Design, Gestion de projet"
          />
        </div>

        <div className="form-group">
          <label>Projets (si pertinent) - listez brievement</label>
          <textarea
            name="projects"
            value={formData.projects}
            onChange={handleChange}
            rows="4"
            placeholder="Nom du projet - Objectif - Techs - Resultat"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Certifications</label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="Ex : AWS Certified - 2023"
            />
          </div>
          <div className="form-group">
            <label>Langues</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="Francais - Courant, Anglais - Avance"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Centres d interet (optionnel)</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="Ex : Football, Photographie"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {initialData.title ? 'Mettre a jour' : 'Creer le CV'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onSave(formData)}
            title="Sauvegarder localement"
          >
            Sauvegarder
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportPdf}
            title={
              isResumeExportValid
                ? 'Exporter en PDF'
                : 'Veuillez remplir les champs obligatoires avant d exporter'
            }
            disabled={!isResumeExportValid}
          >
            Exporter PDF
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportDocx}
            title="Exporter en DOC"
          >
            Exporter DOC
          </button>
        </div>

        {!showForm && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>CV sauvegardes</h3>
              <div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Creer un nouveau CV
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                placeholder="Rechercher par nom / titre"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Toutes categories</option>
                {[...new Set(savedResumes.map((resume) => resume.category).filter(Boolean))].map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
              <button type="button" className="btn-secondary" onClick={loadSavedResumes}>
                Rafraichir
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              {filteredSavedResumes.map((resume) => (
                <div
                  key={resume.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 8,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <div>
                    <strong>{resume.fullName || resume.title}</strong>
                    <br />
                    <small>
                      {resume.category} -{' '}
                      {resume.created ? new Date(resume.created).toLocaleString() : ''}
                    </small>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleLoadSaved(resume)}
                    >
                      Charger
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleDeleteSaved(resume.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              {savedResumes.length === 0 && (
                <div style={{ marginTop: 8 }}>Aucun CV sauvegarde.</div>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <>
            <div className="form-group">
              <label>Photo de profil (optionnelle)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {formData.profilePhoto && (
                <div className="photo-preview">
                  <img
                    src={formData.profilePhoto}
                    alt="Preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: '50%',
                      marginTop: 8,
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Voir les CV sauvegardes
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CreateResumeForm;
