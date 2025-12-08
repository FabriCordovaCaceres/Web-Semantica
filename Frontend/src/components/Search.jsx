import { useEffect, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Badge } from 'react-bootstrap';
import Result from './Result';
import messages_es from '../translations/es.json';
import messages_en from '../translations/en.json';
import messages_fr from '../translations/fr.json';
import messages_pt from '../translations/pt.json';
import { FormattedMessage, IntlProvider } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import './Search.css';
import ProgressBar from './ProgresBar';

const messages = {
  es: messages_es,
  en: messages_en,
  fr: messages_fr,
  pt: messages_pt,
};
const translations = ['es', 'en', 'fr', 'pt'];
const host = 'http://localhost:5000';

function Search() {
  const { locale: localeParam } = useParams();
  const navigate = useNavigate();
  const [locale, setLocale] = useState('es');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchSource, setSearchSource] = useState('');
  const [mode, setMode] = useState('online'); // online | offline | combined

  useEffect(() => {
    if (localeParam && translations.includes(localeParam)) {
      setLocale(localeParam);
    }
  }, [localeParam]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setIsSearchClicked(true);
    setResult(null);

    const encodedQuery = encodeURIComponent(trimmedQuery);
    const requestByMode = {
      combined: {
        buildUrl: (q, lang) => `${host}/search?query=${q}&lang=${lang}`,
        source: 'Combinada (Ontologia Local + DBPedia Cache)',
        map: (data) => data
      },
      online: {
        buildUrl: (q, lang) => `${host}/searchOnline?query=${q}&lang=${lang}`,
        source: 'DBPedia ONLINE (SPARQL en tiempo real)',
        map: (data) => {
          const formatted = {};
          if (data.results && data.results.length > 0) {
            formatted['DBPedia Online - Resultados en tiempo real'] = data.results.map(r => ({
              iri: r.iri,
              name: r.name || r.name_en,
              abstract: r.abstract
            }));
          } else {
            formatted['Sin resultados online'] = [];
          }
          return formatted;
        }
      },
      offline: {
        buildUrl: (q, lang) => `${host}/searchOffline?query=${q}&lang=${lang}`,
        source: 'DBPedia OFFLINE (Cache Local - 500 enfermedades)',
        map: (data) => {
          const formatted = {};
          if (data.results && data.results.length > 0) {
            formatted['DBPedia Offline - Cache Local'] = data.results.map(r => ({
              iri: r.iri,
              name: r.name
            }));
          } else {
            formatted['Sin resultados en cache'] = [];
          }
          return formatted;
        }
      }
    };

    const selected = requestByMode[mode] || requestByMode.combined;
    setSearchSource(selected.source);
    const url = selected.buildUrl(encodedQuery, locale);

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setResult(selected.map(data));
      })
      .catch(error => {
        console.error(error);
        setResult({ 'Error: Sin conexion a internet': [] });
      })
      .finally(() => setLoading(false));
  };

  const handleChangeTranslation = (e) => {
    e.preventDefault();
    const newLocale = e.target.value;
    setLocale(newLocale);
    setResult(null);
    setIsSearchClicked(false);
    navigate(`/${newLocale}`);
  };

  return (
    <div className='container'>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Row
          className={`align-items-center mx-auto transition-container search-row ${
            isSearchClicked ? 'search-moved' : ''
          }`}
        >
          <Col xs={12} md={8} lg={8} className='d-flex justify-content-center'>
            <Form onSubmit={handleSearch} className='search-form w-100'>
              <div className='mt-3 mb-2'>
                <InputGroup size='lg'>
                  <Form.Control
                    placeholder={messages[locale]['app.placeholder']}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button variant='secondary' id='search-button' type='submit' disabled={loading}>
                    <FormattedMessage id='app.search-button' />
                  </Button>
                </InputGroup>
              </div>
            </Form>
          </Col>

          <Col xs={12} md={4} lg={3} className="d-flex justify-content-center mt-2 mt-md-0">
            <Form.Select
              onChange={handleChangeTranslation}
              value={locale}
              className="language-select"
              size="lg"
            >
              {translations.map(t => (
                <option key={t} value={t}>
                  <FormattedMessage id={t} />
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Selector de modo de busqueda Online/Offline/Combinada */}
        <Row className='mt-3 mb-3 justify-content-center'>
          <Col xs={12} className='text-center'>
            <div className='d-inline-flex align-items-center gap-3 flex-wrap mode-switch'>
              <span className='text-light fw-semibold'>Modo</span>
              <Form.Check
                type='radio'
                label='Combinada'
                name='mode'
                id='mode-combined'
                value='combined'
                checked={mode === 'combined'}
                onChange={(e) => setMode(e.target.value)}
              />
              <Form.Check
                type='radio'
                label='Online'
                name='mode'
                id='mode-online'
                value='online'
                checked={mode === 'online'}
                onChange={(e) => setMode(e.target.value)}
              />
              <Form.Check
                type='radio'
                label='Offline'
                name='mode'
                id='mode-offline'
                value='offline'
                checked={mode === 'offline'}
                onChange={(e) => setMode(e.target.value)}
              />
            </div>
            <small className='text-light d-block mt-2'>
              Online: requiere internet | Offline: usa cache local
            </small>
          </Col>
        </Row>

        {/* Indicador de fuente de busqueda */}
        {searchSource && isSearchClicked && (
          <Row className='mb-2'>
            <Col xs={12} className='text-center'>
              <Badge bg={searchSource.includes('ONLINE') ? 'success' : searchSource.includes('OFFLINE') ? 'warning' : 'secondary'} className='p-2'>
                Fuente: {searchSource}
              </Badge>
            </Col>
          </Row>
        )}

        <div className={`mx-auto results-container ${isSearchClicked ? 'show-results' : ''}`}>
          {loading && <ProgressBar/>}
          {!loading && result && Object.keys(result).map(k => (
            <div className='m-3' key={k}>
              <Result locale={locale} nameClass={k} arrayClass={result[k]} />
            </div>
          ))}
          {!loading && isSearchClicked && (!result || Object.keys(result).length === 0) && (
            <div className='text-center text-light'>Sin resultados para "{query}".</div>
          )}
        </div>
      </IntlProvider>
    </div>
  );
}

export default Search;
