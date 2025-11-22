import { useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Badge, Card } from 'react-bootstrap';
import Result from './Result';
import messages_es from '../translations/es.json';
import messages_en from '../translations/en.json';
import messages_fr from '../translations/fr.json';
import messages_pt from '../translations/pt.json';
import { FormattedMessage, IntlProvider } from 'react-intl';
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
  const [locale, setLocale] = useState('es');
  const [query, setQuery] = useState(null);
  const [result, setResult] = useState(null);
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchSource, setSearchSource] = useState('');

  // Búsqueda combinada (ontología local + DBPedia offline)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setSearchSource('Combinada (Ontología Local + DBPedia Caché)');
    await fetch(`${host}/search?query=${query}&lang=${locale}`)
      .then(response => response.json())
      .then(data => {
        setIsSearchClicked(true);
        setResult(data);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }

  // Búsqueda ONLINE - SPARQL en tiempo real a DBPedia
  const handleSearchOnline = async () => {
    if (!query) return;
    setLoading(true);
    setSearchSource('DBPedia ONLINE (SPARQL en tiempo real)');
    await fetch(`${host}/searchOnline?query=${query}&lang=${locale}`)
      .then(response => response.json())
      .then(data => {
        setIsSearchClicked(true);
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
        setResult(formatted);
      })
      .catch(error => {
        console.error(error);
        setResult({ 'Error: Sin conexión a internet': [] });
      })
      .finally(() => setLoading(false));
  }

  // Búsqueda OFFLINE - Caché local de DBPedia (500 enfermedades)
  const handleSearchOffline = async () => {
    if (!query) return;
    setLoading(true);
    setSearchSource('DBPedia OFFLINE (Caché Local - 500 enfermedades)');
    await fetch(`${host}/searchOffline?query=${query}&lang=${locale}`)
      .then(response => response.json())
      .then(data => {
        setIsSearchClicked(true);
        const formatted = {};
        if (data.results && data.results.length > 0) {
          formatted['DBPedia Offline - Caché Local'] = data.results.map(r => ({
            iri: r.iri,
            name: r.name
          }));
        } else {
          formatted['Sin resultados en caché'] = [];
        }
        setResult(formatted);
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }

  const handleChangeTranslation = (e) => {
    e.preventDefault();
    setLocale(e.target.value);
    setResult(null);
    setIsSearchClicked(false);
  };

  return (
    <div className='container'>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <Row
          className={`align-items-center mx-auto transition-container ${
            isSearchClicked ? 'search-moved' : ''
          }`}
        >
          <Col xs={9} lassName='d-flex justify-content-center'>
            <Form onSubmit={handleSubmit} className='search-form' width="width: 100%">
              <div className='mt-3 mb-2'>
                <InputGroup size='lg'>
                  <Form.Control
                    placeholder={messages[locale]['app.placeholder']}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <Button variant='secondary' id='search-button' type='submit'>
                    <FormattedMessage id='app.search-button' />
                  </Button>
                </InputGroup>
              </div>
            </Form>
          </Col>

          <Col xs={3} className="d-flex justify-content-center">
            <Form.Select onChange={handleChangeTranslation}>
              {translations.map(t => (
                <option key={t} value={t}>
                  <FormattedMessage id={t} />
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Botones de búsqueda Online/Offline */}
        <Row className='mt-3 mb-3 justify-content-center'>
          <Col xs={12} className='text-center'>
            <div className='d-flex justify-content-center gap-2 flex-wrap'>
              <Button
                variant='success'
                onClick={handleSearchOnline}
                disabled={!query || loading}
              >
                Buscar ONLINE (DBPedia)
              </Button>
              <Button
                variant='warning'
                onClick={handleSearchOffline}
                disabled={!query || loading}
              >
                Buscar OFFLINE (Caché)
              </Button>
            </div>
            <small className='text-muted d-block mt-2'>
              Online: Requiere internet | Offline: Funciona sin internet
            </small>
          </Col>
        </Row>

        {/* Indicador de fuente de búsqueda */}
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
          {loading ? <ProgressBar/> : result && Object.keys(result).map(k => (
            <div className='m-3' key={k}>
              <Result locale={locale} nameClass={k} arrayClass={result[k]} />
            </div>
          ))}
        </div>
      </IntlProvider>
    </div>
  );
}

export default Search;
