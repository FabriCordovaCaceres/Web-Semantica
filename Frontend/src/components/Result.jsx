import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Result(props) {
  const { locale, nameClass, arrayClass } = props;

  return (
    <div>
      <Card>
        <Card.Body>
          <Card.Header><h5>{ nameClass }</h5></Card.Header>
          {arrayClass.map((a, i) => (
            <React.Fragment key={i}>
              { a.iri &&
                a.iri.toLowerCase().startsWith('http') &&
                a.iri.toLowerCase().includes('dbpedia.org')
                ? (
                  <a href={a.iri} target='_blank' rel='noreferrer'>
                    <Card.Subtitle className='m-2'>{a.name}</Card.Subtitle>
                  </a>
                ) : (
                  <Link to={`/${locale}/class/${encodeURIComponent(nameClass)}/individual/${encodeURIComponent(a.iri)}`}>
                    <Card.Subtitle className='m-2'>{a.name}</Card.Subtitle>
                  </Link>
                )
              }
            </React.Fragment>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
}

export default Result;
