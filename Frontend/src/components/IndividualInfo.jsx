import { Badge, Card, Spinner } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const host = 'http://localhost:5000';

const formatLabel = (text = '') =>
  text.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value) => {
  if (value === null || typeof value === 'undefined') return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return Object.values(value).join(' ');
  return value;
};

function IndividualInfo() {
  const { locale, nameClass, individualIri } = useParams();
  const [individual, setIndividual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nameClass || !individualIri) {
      setIndividual(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const decodedClass = decodeURIComponent(nameClass);
      const normalizedClass = decodedClass.includes('.')
        ? decodedClass.split('.').pop()
        : decodedClass.replace('ontology.owx.', '');
      const decodedIri = decodeURIComponent(individualIri);

      try {
        const response = await fetch(`${host}/searchClass?query=${normalizedClass}&lang=${locale}`);
        const data = await response.json();
        setIndividual(data.find((d) => d.iri === decodedIri) || null);
      } catch (error) {
        console.error(error);
        setIndividual(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nameClass, individualIri, locale]);

  const properties = useMemo(() => individual?.properties || [], [individual]);

  const renderProperty = (entry, depth = 0, keyPrefix = '') => {
    const [key, value] = Object.entries(entry || {})[0] || [];
    if (!key) return null;

    if (key === 'relationship' && value) {
      const relationLabel = formatValue(value.name_object);
      const children = value.properties || [];
      return (
        <li key={`${keyPrefix}${relationLabel}-${depth}`} className={`property-item depth-${depth}`}>
          <span className='property-key'>{relationLabel}</span>
          {children.length > 0 && (
            <ul className='property-list nested'>
              {children.map((child, idx) =>
                renderProperty(child, depth + 1, `${relationLabel}-${idx}-`)
              )}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={`${keyPrefix}${key}-${depth}`} className={`property-item depth-${depth}`}>
        <span className='property-key'>{formatLabel(key)}:</span>
        <span className='property-value'>{formatValue(value)}</span>
      </li>
    );
  };

  return (
    <div className='instance-page'>
      {loading && (
        <div className='instance-loader'>
          <Spinner animation='border' variant='light' />
          <span className='ms-2 text-light'>Cargando instancia...</span>
        </div>
      )}

      {!loading && individual && (
        <Card className='instance-card'>
          <Card.Body>
            <div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
              <div>
                <Card.Title className='instance-title mb-0'>{individual.name_individual}</Card.Title>
                <a
                  href={individual.iri}
                  className='instance-link'
                  target='_blank'
                  rel='noreferrer'
                >
                  {individual.iri}
                </a>
              </div>
              <Badge bg='light' text='dark' className='instance-badge'>
                {formatLabel(nameClass)}
              </Badge>
            </div>

            <hr className='instance-divider' />

            {properties.length > 0 ? (
              <ul className='property-list'>
                {properties.map((entry, idx) => renderProperty(entry, 0, `prop-${idx}-`))}
              </ul>
            ) : (
              <div className='text-light'>Sin propiedades para mostrar.</div>
            )}
          </Card.Body>
        </Card>
      )}

      {!loading && !individual && (
        <div className='instance-empty text-center text-light'>No se encontraron datos.</div>
      )}
    </div>
  );
}

export default IndividualInfo;
