import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import PdfExportService from './utils/PdfExportService';
import CreateResumeForm from './components/CreateResumeForm';
import TemplateSelector from './components/TemplateSelector';
import CoverLetterBuilder from './components/CoverLetterBuilder';
import ResumeView from './components/ResumeViewer';
import Assistant from './components/Assistant';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const getStoredResumes = () => {
  try {
    return JSON.parse(localStorage.getItem('resumes') || '[]');
  } catch (error) {
    console.error('Unable to read resumes from localStorage', error);
    return [];
  }
};

const getStoredCoverLetters = () => {
  try {
    return JSON.parse(localStorage.getItem('coverLetters') || '[]');
  } catch (error) {
    console.error('Unable to read cover letters from localStorage', error);
    return [];
  }
};

const findResumeById = (id, resumes = []) => {
  if (!id) return null;
  const fromState = resumes.find((resume) => String(resume.id) === String(id));
  if (fromState) return fromState;
  return getStoredResumes().find((resume) => String(resume.id) === String(id)) || null;
};

const getTemplateSettingsFromSearch = (search) => {
  const params = new URLSearchParams(search || '');
  return {
    template: params.get('template') || '',
    colorScheme: params.get('color') || '',
    font: params.get('font') || '',
  };
};

function AppContent() {
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [filteredLetters, setFilteredLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');
  const [activeCollection, setActiveCollection] = useState('resumes');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isHomePage = currentPath === '/';
  const isAssistantRoute = currentPath === '/build' || currentPath.startsWith('/build/');

  const loadSavedContent = useCallback(() => {
    setLoading(true);
    const storedResumes = getStoredResumes();
    const storedLetters = getStoredCoverLetters();
    setResumes(storedResumes);
    setFilteredResumes(storedResumes);
    setCoverLetters(storedLetters);
    setFilteredLetters(storedLetters);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSavedContent();
  }, [loadSavedContent]);

  useEffect(() => {
    document.title = 'Career Studio - CV et lettre de motivation';
  }, []);

  useEffect(() => {
    const q = searchTerm.toLowerCase();

    let resumeResults = [...resumes];
    if (q) {
      resumeResults = resumeResults.filter(
        (resume) =>
          (resume.title || '').toLowerCase().includes(q) ||
          (resume.summary || '').toLowerCase().includes(q) ||
          (resume.fullName || '').toLowerCase().includes(q) ||
          (resume.skills && resume.skills.some((skill) => String(skill).toLowerCase().includes(q)))
      );
    }
    if (selectedCategory !== 'all') {
      resumeResults = resumeResults.filter(
        (resume) => (resume.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    resumeResults.sort((a, b) => {
      if (sortBy === 'experience') return (parseInt(b.experience, 10) || 0) - (parseInt(a.experience, 10) || 0);
      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
      return (a.title || '').localeCompare(b.title || '');
    });
    setFilteredResumes(resumeResults);

    let letterResults = [...coverLetters];
    if (q) {
      letterResults = letterResults.filter(
        (letter) =>
          (letter.position || '').toLowerCase().includes(q) ||
          (letter.companyName || '').toLowerCase().includes(q) ||
          (letter.senderName || '').toLowerCase().includes(q) ||
          (letter.introduction || '').toLowerCase().includes(q) ||
          (letter.body || '').toLowerCase().includes(q)
      );
    }
    letterResults.sort((a, b) => {
      if (sortBy === 'category') return (a.companyName || '').localeCompare(b.companyName || '');
      return (a.position || '').localeCompare(b.position || '');
    });
    setFilteredLetters(letterResults);
  }, [resumes, coverLetters, searchTerm, selectedCategory, sortBy]);

  useEffect(() => {
    if (isAssistantRoute) setAssistantOpen(true);
  }, [isAssistantRoute]);

  useEffect(() => {
    if (currentPath === '/') {
      loadSavedContent();
    }
  }, [currentPath, loadSavedContent]);

  const getCategories = () => [...new Set(resumes.map((resume) => resume.category))].filter(Boolean);
  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('title');
    setFilteredResumes(resumes);
    setFilteredLetters(coverLetters);
  };
  const handleSaveResume = (resumeData) => {
    const resumeId = resumeData.id || Date.now();
    const normalizedResume = {
      ...resumeData,
      id: resumeId,
      created: resumeData.created || new Date().toISOString(),
      summary: resumeData.summary || 'Aucun resume disponible',
      skills: Array.isArray(resumeData.skills)
        ? resumeData.skills
        : (resumeData.skills ? resumeData.skills.split(',').map((skill) => skill.trim()) : []),
      experience: resumeData.experience || '',
      fullText: resumeData.summary || resumeData.fullText || '',
      html: resumeData.html || '',
      template: resumeData.template || 'modern',
      colorScheme: resumeData.colorScheme || 'blue',
      font: resumeData.font || 'Arial',
    };

    const updated = resumeData.id
      ? resumes.map((resume) => (String(resume.id) === String(resumeData.id) ? normalizedResume : resume))
      : [...resumes, normalizedResume];

    const stored = getStoredResumes();
    const storedUpdated = resumeData.id
      ? stored.map((resume) => (String(resume.id) === String(resumeData.id) ? normalizedResume : resume))
      : [...stored, normalizedResume];

    setResumes(updated);
    setFilteredResumes(updated);
    localStorage.setItem('resumes', JSON.stringify(storedUpdated));
    loadSavedContent();
    alert(resumeData.id ? 'CV mis a jour avec succes !' : 'CV cree avec succes !');
  };
  const handleSaveCoverLetter = (letterData) => {
    const saved = getStoredCoverLetters();
    saved.push({ id: Date.now(), ...letterData, created: new Date().toISOString() });
    localStorage.setItem('coverLetters', JSON.stringify(saved));
    loadSavedContent();
    alert('Lettre de motivation sauvegardee !');
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner-container"><div className="spinner" /><p>Chargement des CV...</p></div></div>;
  }

  return (
    <>
      <RouteScrollToTop />
      <div className="app">
        {isHomePage && (
          <header className="app-header">
            <div className="header-content">
              <div className="home-hero-panel">
                <div className="brand-lockup">
                  <img
                    src="/career-studio-logo.svg"
                    alt="Career Studio"
                    className="brand-logo"
                  />
                  <div className="brand-copy">
                    <span className="home-kicker">Career Studio</span>
                    <p className="brand-tagline">CV et lettre de motivation</p>
                  </div>
                </div>
                <h1>Career Studio</h1>
                <p className="subtitle">Parcourez, recherchez et filtrez des CV professionnels.</p>
                <div className="home-pills">
                  <span>Parcours simple</span>
                  <span>Assistant IA</span>
                  <span>Modeles modernes</span>
                </div>
                <nav className="main-nav">
                  <Link to="/" className="nav-link">Accueil</Link>
                  <Link to="/build" className="nav-link">Assistant CV</Link>
                  <Link to="/create" className="nav-link">Creer CV simple</Link>
                  <Link to="/cover-letter" className="nav-link">Lettres</Link>
                  <Link to="/templates" className="nav-link">Modeles</Link>
                </nav>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat"><span className="stat-number">{resumes.length}</span><span className="stat-label">CV</span></div>
              <div className="stat"><span className="stat-number">{coverLetters.length}</span><span className="stat-label">Lettres</span></div>
              <div className="stat"><span className="stat-number">{getCategories().length}</span><span className="stat-label">Categories</span></div>
              <div className="stat"><span className="stat-number">{activeCollection === 'resumes' ? filteredResumes.length : filteredLetters.length}</span><span className="stat-label">Resultats</span></div>
            </div>
          </header>
        )}

        <main className="main-content">
          <Routes>
            <Route path="/" element={(
              <>
                <section className="filters-section">
                  <div className="section-header">
                    <div>
                      <h2>Recherche et filtres</h2>
                      <div className="collection-switch">
                        <button
                          className={`collection-btn ${activeCollection === 'resumes' ? 'active' : ''}`}
                          onClick={() => setActiveCollection('resumes')}
                        >
                          CV enregistres
                        </button>
                        <button
                          className={`collection-btn ${activeCollection === 'letters' ? 'active' : ''}`}
                          onClick={() => setActiveCollection('letters')}
                        >
                          Lettres enregistrees
                        </button>
                      </div>
                    </div>
                    <div className="view-controls">
                      <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Vue grille">Grille</button>
                      <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Vue liste">Liste</button>
                    </div>
                  </div>
                  <div className="filters-grid">
                    <div className="filter-group"><label htmlFor="search">Recherche</label><input id="search" type="text" placeholder={activeCollection === 'resumes' ? 'Rechercher par titre, competences ou mots-cles...' : 'Rechercher par poste, entreprise ou auteur...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" /></div>
                    <div className="filter-group"><label htmlFor="category">Categorie</label><select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="category-select" disabled={activeCollection !== 'resumes'}><option value="all">{activeCollection === 'resumes' ? 'Toutes les categories' : 'Filtre CV uniquement'}</option>{getCategories().map((cat, index) => <option key={index} value={cat}>{cat}</option>)}</select></div>
                    <div className="filter-group"><label htmlFor="sort">Trier par</label><select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select"><option value="title">Titre (A-Z)</option><option value="experience">Experience</option><option value="category">Categorie</option></select></div>
                    <div className="filter-group actions"><button onClick={handleReset} className="btn-reset">Effacer les filtres</button></div>
                  </div>
                  <div className="results-summary">
                    <span className="results-count">{activeCollection === 'resumes' ? `${filteredResumes.length} CV sur ${resumes.length} trouves` : `${filteredLetters.length} lettres sur ${coverLetters.length} trouvees`}</span>
                    {searchTerm && <span className="search-term">pour "<strong>{searchTerm}</strong>"</span>}
                  </div>
                </section>
                <section className="resumes-section">
                  {(activeCollection === 'resumes' ? filteredResumes.length === 0 : filteredLetters.length === 0) ? (
                    <div className="empty-state">
                      <span className="empty-state-kicker">{activeCollection === 'resumes' ? 'CV' : 'Lettres'}</span>
                      <h3>{activeCollection === 'resumes' ? 'Aucun CV trouve' : 'Aucune lettre trouvee'}</h3>
                      <p>{activeCollection === 'resumes' ? 'Seuls les CV enregistres apparaissent ici et peuvent etre recherches.' : 'Seules les lettres enregistrees apparaissent ici et peuvent etre recherchees.'}</p>
                      <button onClick={handleReset} className="btn-reset-filters">Effacer tous les filtres</button>
                      <div className="empty-state-actions">
                        {activeCollection === 'resumes' ? (
                          <>
                            <Link to="/build" className="create-resume-btn assistant-btn">Utiliser l'Assistant CV</Link>
                            <Link to="/create" className="create-resume-btn">Creer un CV simple</Link>
                          </>
                        ) : (
                          <Link to="/cover-letter" className="create-resume-btn letter-btn">Creer une lettre</Link>
                        )}
                      </div>
                    </div>
                  ) : activeCollection === 'resumes' ? (
                    viewMode === 'grid' ? (
                      <div className="resumes-grid">{filteredResumes.map((resume) => <ResumeCard key={resume.id} resume={resume} onViewDetails={() => { setSelectedResume(resume); setShowModal(true); }} />)}</div>
                    ) : (
                      <div className="resumes-list">{filteredResumes.map((resume) => <ResumeListItem key={resume.id} resume={resume} onViewDetails={() => { setSelectedResume(resume); setShowModal(true); }} />)}</div>
                    )
                  ) : (
                    <div className={viewMode === 'grid' ? 'resumes-grid' : 'resumes-list'}>
                      {filteredLetters.map((letter) => <LetterCard key={letter.id} letter={letter} />)}
                    </div>
                  )}
                  {(activeCollection === 'resumes' ? filteredResumes.length > 0 : filteredLetters.length > 0) && (
                    <div className="create-resume-cta"><div className="cta-buttons">{activeCollection === 'resumes' ? <><Link to="/build" className="create-resume-btn assistant-btn">Utiliser l'Assistant CV</Link><Link to="/create" className="create-resume-btn">Creer un CV simple</Link><Link to="/templates" className="create-resume-btn templates-btn">Voir les modeles</Link></> : <Link to="/cover-letter" className="create-resume-btn letter-btn">Creer une lettre</Link>}</div></div>
                  )}
                </section>
              </>
            )} />

            <Route path="/build" element={<div className="assistant-route-page" />} />
            <Route path="/build/:id" element={<div className="assistant-route-page" />} />
            <Route path="/create" element={<CreateResumePage onSave={handleSaveResume} resumes={resumes} />} />
            <Route path="/edit/:id" element={<EditResumePage onSave={handleSaveResume} resumes={resumes} />} />
            <Route path="/view/:id" element={<div className="view-resume-page page-shell"><div className="page-header"><h2>Details du CV</h2><Link to="/" className="back-link">Retour a l'accueil</Link></div><ResumeView /></div>} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/cover-letter" element={<div className="cover-letter-page page-shell"><div className="page-header"><h2>Lettre de motivation</h2><div className="page-header-actions"><Link to="/" className="back-link">Retour a l'accueil</Link></div></div><CoverLetterBuilder onSave={handleSaveCoverLetter} /></div>} />
            <Route path="/export" element={<div className="export-page page-shell"><div className="page-header"><h2>Exporter votre CV</h2><Link to="/" className="back-link">Retour a l'accueil</Link></div><div className="export-options-page"><h3>Options d'export disponibles</h3><p>Exportez votre CV dans differents formats selon vos besoins.</p><div className="export-features"><div className="export-feature"><div className="feature-icon">PDF</div><div className="feature-content"><h4>PDF haute qualite</h4><p>Export fidele a l'affichage ecran, parfait pour l'envoi par email.</p><p className="feature-info">Disponible dans l'Assistant CV - Etape 3</p></div></div><div className="export-feature"><div className="feature-icon">IMP</div><div className="feature-content"><h4>PDF optimise pour impression</h4><p>Format structure avec marges adaptees a l'impression.</p><p className="feature-info">Disponible dans l'Assistant CV - Etape 3</p></div></div><div className="export-feature"><div className="feature-icon">DOC</div><div className="feature-content"><h4>Document Word</h4><p>Format .doc modifiable facilement.</p><p className="feature-info">Disponible dans l'Assistant CV - Etape 3</p></div></div><div className="export-feature"><div className="feature-icon">Print</div><div className="feature-content"><h4>Impression directe</h4><p>Utilisez l'impression navigateur pour un controle complet.</p><p className="feature-info">Ctrl+P depuis n'importe quelle page</p></div></div></div><div className="export-guide"><h4>Guide d'export :</h4><ol><li>Allez dans <strong>Assistant CV</strong> ou creez un nouveau CV.</li><li>Remplissez vos informations (Etape 1).</li><li>Choisissez un modele (Etape 2).</li><li>Dans l'etape 3 (Apercu), cliquez sur <strong>"Exporter le CV"</strong>.</li><li>Selectionnez le format souhaite.</li></ol><div className="export-cta"><Link to="/build" className="export-cta-btn">Acceder a l'Assistant d'export</Link></div></div></div></div>} />
            <Route path="*" element={<div className="not-found-page"><div className="not-found-content"><h1>404</h1><h2>Page non trouvee</h2><p>La page que vous recherchez n'existe pas ou a ete deplacee.</p><div className="not-found-actions"><Link to="/" className="action-btn">Retour a l'accueil</Link><Link to="/build" className="action-btn">Creer un CV</Link></div></div></div>} />
          </Routes>
        </main>

        {showModal && selectedResume && <ResumeModal resume={selectedResume} onClose={() => setShowModal(false)} />}

        <Assistant isOpen={assistantOpen} onClose={() => {
          setAssistantOpen(false);
          if (isAssistantRoute) navigate('/');
        }} />
        {isHomePage && !assistantOpen && <button className="floating-assistant-btn" onClick={() => setAssistantOpen(true)} title="Ouvrir l'assistant">IA</button>}

        {isHomePage && (
          <footer className="app-footer">
            <div className="footer-content">
              <p className="footer-title">Career Studio - {new Date().getFullYear()}</p>
              <p className="footer-info">Gestion de {resumes.length} CV professionnels et de {coverLetters.length} lettres - {getCategories().length} categories</p>
              <div className="footer-links"><Link to="/">Accueil</Link><span className="separator">|</span><Link to="/build">Assistant CV</Link><span className="separator">|</span><Link to="/templates">Modeles</Link><span className="separator">|</span><Link to="/create">Creer CV</Link><span className="separator">|</span><Link to="/cover-letter">Lettres</Link><span className="separator">|</span><Link to="/export">Exporter</Link></div>
              <div className="footer-credits"><p>Career Studio - fonctionnalites completes</p></div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}

const CreateResumePage = ({ onSave, resumes }) => {
  const location = useLocation();
  const templateSettings = getTemplateSettingsFromSearch(location.search);

  return (
    <div className="create-resume-page page-shell">
      <div className="page-header">
        <div>
          <h2>Creer un nouveau CV</h2>
          {templateSettings.template && (
            <p className="page-subnote">
              Modele applique : {templateSettings.template} | Couleur : {templateSettings.colorScheme || 'blue'} | Police : {templateSettings.font || 'Arial'}
            </p>
          )}
        </div>
        <div className="page-header-actions">
          <Link to="/build" className="nav-link">Utiliser l'Assistant</Link>
          <Link to="/" className="back-link">Retour a l'accueil</Link>
        </div>
      </div>
      <CreateResumeForm
        onSave={onSave}
        initialData={{
          ...templateSettings,
          colorScheme: templateSettings.colorScheme || 'blue',
          font: templateSettings.font || 'Arial',
          template: templateSettings.template || 'modern',
        }}
      />
    </div>
  );
};

const EditResumePage = ({ onSave, resumes }) => {
  const { id } = useParams();
  const location = useLocation();
  const foundResume = findResumeById(id, resumes);
  const templateSettings = getTemplateSettingsFromSearch(location.search);

  return (
    <div className="edit-resume-page page-shell">
      <div className="page-header">
        <div>
          <h2>Modifier le CV</h2>
          {foundResume?.template && (
            <p className="page-subnote">
              Modele actuel : {templateSettings.template || foundResume.template} | Couleur : {templateSettings.colorScheme || foundResume.colorScheme || 'blue'} | Police : {templateSettings.font || foundResume.font || 'Arial'}
            </p>
          )}
        </div>
        <div className="page-header-actions">
          <Link to="/" className="back-link">Retour a l'accueil</Link>
        </div>
      </div>
      <CreateResumeForm
        onSave={onSave}
        initialData={{
          ...(foundResume || {}),
          ...templateSettings,
          template: templateSettings.template || foundResume?.template || 'modern',
          colorScheme: templateSettings.colorScheme || foundResume?.colorScheme || 'blue',
          font: templateSettings.font || foundResume?.font || 'Arial',
        }}
      />
    </div>
  );
};

const TemplatesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="templates-page page-shell">
      <div className="page-header">
        <h2>Modeles de CV</h2>
        <div className="page-header-actions">
          <Link to="/build" className="nav-link">Creer avec l'Assistant</Link>
          <Link to="/" className="back-link">Retour a l'accueil</Link>
        </div>
      </div>
      <TemplateSelector
        selectedTemplate="modern"
        selectedColor="blue"
        selectedFont="Arial"
        onSelect={(template, color, font) => {
          navigate(`/create?template=${template}&color=${color}&font=${font}`);
        }}
        resumeData={{
          fullName: 'Exemple Nom',
          title: 'Exemple Poste',
          email: 'exemple@email.com',
          phone: '+33 1 23 45 67 89',
          summary: 'Ceci est un exemple de resume professionnel.',
        }}
      />
      <div className="template-info-section">
        <h3>Comment choisir votre modele ?</h3>
        <div className="template-tips">
          <div className="tip">
            <div className="tip-icon">Pro</div>
            <div className="tip-content">
              <h4>Moderne / Classique</h4>
              <p>Ideal pour les postes corporatifs, la finance et le management.</p>
            </div>
          </div>
          <div className="tip">
            <div className="tip-icon">Crea</div>
            <div className="tip-content">
              <h4>Creatif</h4>
              <p>Parfait pour le design, le marketing, les arts et la communication.</p>
            </div>
          </div>
          <div className="tip">
            <div className="tip-icon">Tech</div>
            <div className="tip-content">
              <h4>Technique</h4>
              <p>Specialement concu pour les developpeurs et les ingenieurs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RouteScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);
  return null;
};

const ResumeCard = ({ resume, onViewDetails }) => (
  <div className="resume-card" onClick={onViewDetails}>
    <div className="card-header">
      <div className="card-title"><h3>{resume.title}</h3><span className={`category-badge ${resume.category.toLowerCase()}`}>{resume.category}</span></div>
      {resume.experience && <div className="experience-badge">{resume.experience}</div>}
    </div>
    <div className="card-body"><p className="summary">{resume.summary}</p>{resume.skills && resume.skills.length > 0 && <div className="skills-section"><div className="skills-tags">{resume.skills.slice(0, 3).map((skill, index) => <span key={index} className="skill-tag">{skill}</span>)}{resume.skills.length > 3 && <span className="skill-tag more">+{resume.skills.length - 3}</span>}</div></div>}</div>
    <div className="card-footer"><button className="view-details-btn">Voir les details</button><div className="card-actions"><Link to={`/edit/${resume.id}`} className="card-action-btn edit-btn" onClick={(e) => e.stopPropagation()}>Modifier</Link><Link to={`/build/${resume.id}`} className="card-action-btn build-btn" onClick={(e) => e.stopPropagation()}>Assistant</Link><button className="card-action-btn pdf-btn" onClick={(e) => { e.stopPropagation(); (async () => { try { const filename = `${resume.title || 'cv'}-${resume.id}.pdf`; await PdfExportService.generateFromData(resume, { filename }); alert('PDF telecharge : ' + filename); } catch (err) { console.error('Export PDF failed', err); alert('Erreur lors de l\'export PDF: ' + (err.message || err)); } })(); }} title="Exporter en PDF">PDF</button></div></div>
  </div>
);

const ResumeListItem = ({ resume, onViewDetails }) => (
  <div className="resume-list-item" onClick={onViewDetails}>
    <div className="list-item-main">
      <div className="list-item-left"><h3 className="list-item-title">{resume.title}</h3><p className="list-item-summary">{resume.summary}</p></div>
      <div className="list-item-right"><div className="list-item-meta"><span className={`category-label ${resume.category.toLowerCase()}`}>{resume.category}</span>{resume.experience && <span className="experience-label">{resume.experience}</span>}</div>{resume.skills && resume.skills.length > 0 && <div className="list-item-skills">{resume.skills.slice(0, 2).map((skill, index) => <span key={index} className="skill-label">{skill}</span>)}{resume.skills.length > 2 && <span className="skill-label more">+{resume.skills.length - 2}</span>}</div>}<div className="list-item-actions"><Link to={`/edit/${resume.id}`} className="list-action-btn edit-btn" onClick={(e) => e.stopPropagation()}>Modifier</Link><Link to={`/build/${resume.id}`} className="list-action-btn build-btn" onClick={(e) => e.stopPropagation()}>Assistant</Link><button className="list-action-btn pdf-btn" onClick={(e) => { e.stopPropagation(); (async () => { try { const filename = `${resume.title || 'cv'}-${resume.id}.pdf`; await PdfExportService.generateFromData(resume, { filename }); alert('PDF telecharge : ' + filename); } catch (err) { console.error('Export PDF failed', err); alert('Erreur lors de l\'export PDF: ' + (err.message || err)); } })(); }}>Exporter</button></div></div>
    </div>
  </div>
);

const LetterCard = ({ letter }) => (
  <div className="resume-card">
    <div className="card-header">
      <div className="card-title">
        <h3>{letter.position || 'Lettre de motivation'}</h3>
        <span className="category-badge">LETTRE</span>
      </div>
    </div>
    <div className="card-body">
      <p className="summary">{letter.companyName || 'Entreprise non renseignee'}</p>
      <p className="summary">{letter.senderName || 'Auteur non renseigne'}</p>
      <p className="summary">{letter.introduction || letter.body || 'Contenu non renseigne'}</p>
    </div>
    <div className="card-footer">
      <Link to="/cover-letter" className="view-details-btn">Ouvrir Lettres</Link>
    </div>
  </div>
);

const ResumeModal = ({ resume, onClose }) => {
  const [activeTab, setActiveTab] = useState('preview');
  if (!resume) return null;
  const safeFullText = resume.fullText || '';
  const safeSkills = resume.skills || [];
  const safeSummary = resume.summary || 'Aucun resume disponible';
  const safeTitle = resume.title || 'Sans titre';
  const safeCategory = resume.category || 'Inconnu';
  const safeExperience = resume.experience || '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title-section"><h2>{safeTitle}</h2><div className="modal-meta"><span className={`modal-category ${safeCategory.toLowerCase()}`}>{safeCategory}</span>{safeExperience && <span className="modal-experience">{safeExperience} d'experience</span>}</div></div><button className="modal-close" onClick={onClose}>X</button></div>
        <div className="modal-tabs"><button className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Apercu</button><button className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>Competences</button><button className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`} onClick={() => setActiveTab('raw')}>Texte brut</button><button className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>Actions</button></div>
        <div className="modal-body">
          {activeTab === 'preview' && <div className="tab-content preview"><div className="section"><h3>Resume</h3><p>{safeSummary}</p></div><div className="section"><h3>Apercu du texte</h3><div className="text-preview"><pre>{safeFullText.substring(0, 800) || 'Aucun texte disponible'}...</pre></div></div></div>}
          {activeTab === 'skills' && <div className="tab-content skills"><h3>Competences et expertise</h3>{safeSkills.length > 0 ? <div className="skills-grid">{safeSkills.map((skill, index) => <div key={index} className="skill-item">{skill}</div>)}</div> : <p className="no-skills">Aucune competence listee dans ce CV.</p>}</div>}
          {activeTab === 'raw' && <div className="tab-content raw"><h3>Texte complet du CV</h3><div className="raw-text-container"><textarea readOnly value={safeFullText || 'Aucun texte disponible'} className="raw-textarea" /></div></div>}
          {activeTab === 'actions' && <div className="tab-content actions"><h3>Actions disponibles</h3><div className="action-buttons"><Link to={`/edit/${resume.id}`} className="action-btn modal-action-btn" onClick={onClose}>Modifier ce CV</Link><Link to={`/build/${resume.id}`} className="action-btn modal-action-btn assistant-btn" onClick={onClose}>Ouvrir avec l'Assistant</Link><button className="action-btn modal-action-btn" onClick={() => { navigator.clipboard.writeText(safeFullText); alert('CV copie dans le presse-papiers !'); }}>Copier le texte</button><button className="action-btn modal-action-btn export-btn" onClick={async () => { try { const filename = `${resume.title || 'cv'}-${resume.id}.pdf`; await PdfExportService.generateFromData(resume, { filename }); alert('PDF telecharge : ' + filename); } catch (err) { console.error('Export PDF failed', err); alert('Erreur lors de l\'export PDF: ' + (err.message || err)); } }}>Exporter en PDF</button></div></div>}
        </div>
        <div className="modal-footer"><div className="footer-actions"><button className="btn-close-modal" onClick={onClose}>Fermer</button><button className="btn-copy" onClick={() => { navigator.clipboard.writeText(safeFullText); alert('Texte du CV copie dans le presse-papiers !'); }} disabled={!safeFullText}>Copier le texte</button></div></div>
      </div>
    </div>
  );
};

export default App;
