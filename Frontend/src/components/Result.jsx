import React from 'react';
import { Card, Badge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Result.css';

function Result(props) {
  const { locale, nameClass, arrayClass } = props;

  // Determinar si es DBPedia para aplicar estilos diferentes
  const isDBPedia = nameClass.toLowerCase().includes('dbpedia');
  const isOnline = nameClass.toLowerCase().includes('online');

  return (
    <div className="result-container">
      <Card className={`result-card ${isDBPedia ? 'dbpedia-card' : 'ontology-card'}`}>
        <Card.Header className="result-header">
          <div className="header-content">
            <h5 className="category-title">{nameClass}</h5>
            <Badge bg={isOnline ? 'success' : isDBPedia ? 'info' : 'secondary'} className="result-count">
              {arrayClass.length} {arrayClass.length === 1 ? 'resultado' : 'resultados'}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="result-body">
          <ListGroup variant="flush">
            {arrayClass.map((a, i) => (
              <ListGroup.Item key={i} className="result-item">
                {a.iri &&
                a.iri.toLowerCase().startsWith('http') &&
                a.iri.toLowerCase().includes('dbpedia.org')
                  ? (
                    <a
                      href={a.iri}
                      target='_blank'
                      rel='noreferrer'
                      className="result-link external-link"
                    >
                      <div className="link-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="link-icon" viewBox="0 0 16 16">
                          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                        </svg>
                        <span className="link-text">{a.name}</span>
                        {a.abstract && <p className="result-abstract">{a.abstract}</p>}
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="external-icon" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                        <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                      </svg>
                    </a>
                  ) : (
                    <Link
                      to={`/${locale}/class/${encodeURIComponent(nameClass)}/individual/${encodeURIComponent(a.iri)}`}
                      className="result-link internal-link"
                    >
                      <div className="link-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="link-icon" viewBox="0 0 16 16">
                          <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z"/>
                        </svg>
                        <span className="link-text">{a.name}</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="chevron-icon" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </Link>
                  )
                }
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Result;
