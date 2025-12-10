from rdflib import Graph, RDF, URIRef
from SPARQLWrapper import SPARQLWrapper, XML, JSON
from xml.etree import ElementTree

from preprocess import preprocess, match
from ontology import store_in_ontology

"""
IMPORT DISEASE ONTOLOGY
"""
sparql = SPARQLWrapper("http://dbpedia.org/sparql")
sparql.setReturnFormat(XML)
sparql.setQuery("""
    select distinct ?disease where {
        ?disease rdf:type dbo:Disease .
    }
    limit 500
""")

results = sparql.query().convert()
graph = Graph()

root = ElementTree.fromstring(results.toxml())

"""DELETE ALL DUPLICATED INSTANCES"""
for result in root.findall(".//{http://www.w3.org/2005/sparql-results#}result"):
    uri = result.find(".//{http://www.w3.org/2005/sparql-results#}uri")
    if uri is not None:
        disease_uri = URIRef(uri.text)
        graph.add((disease_uri, RDF.type, URIRef("http://dbpedia.org/ontology/Disease")))

def verificate_name(name_search):
    sparql.setReturnFormat(JSON)

    sparql.setQuery(f"""
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?related ?name
        WHERE {{
            ?resource dct:subject/skos:broader* <http://dbpedia.org/resource/Category:Oncology> ;
                    dbo:wikiPageWikiLink ?related .
            ?related rdfs:label ?name .
            FILTER(lang(?name) = "en")
        }}
            
    """)
    results = [bind["name"]["value"] for bind in sparql.query().convert()['results']['bindings']]

    result_query = []
    for name in results:
        if name_search in name:
            result_query.append(name)
        if len(result_query) > 50 :
            break

    if len(result_query) > 0:
        return result_query
    else:
        return {"error" : 400,"message ": "No existe la entidad en la ontologia de dbpedia"}

# Pre-construir índice de DBPedia
_dbpedia_index = None

def build_dbpedia_index():
	"""Construye índice de DBPedia una sola vez"""
	global _dbpedia_index
	if _dbpedia_index is not None:
		return _dbpedia_index

	_dbpedia_index = []
	for iri, predicate, obj in graph.triples((None, RDF.type, None)):
		name = preprocess(str(iri).split('/')[-1])
		_dbpedia_index.append({'iri': str(iri), 'name': name})

	print(f"Índice DBPedia construido con {len(_dbpedia_index)} enfermedades")
	return _dbpedia_index

# Construir al cargar
build_dbpedia_index()

def searchDBPedia(query):
	"""Búsqueda optimizada con índice pre-construido"""
	results = []
	index = build_dbpedia_index()

	for entry in index:
		if match(entry['name'], query) >= 50.0:
			results.append({'iri': entry['iri'], 'name': entry['name']})

	return results

def searchDBPediaOnline(query, lang='es'):
    """
    BÚSQUEDA ONLINE: Consulta SPARQL en tiempo real a DBPedia.
    Busca enfermedades relacionadas con oncología que coincidan con la query.
    Soporta múltiples idiomas: es, en, fr, pt
    """
    sparql.setReturnFormat(JSON)

    # Mapeo de códigos de idioma a códigos de DBPedia
    lang_codes = {
        'es': 'es',  # Español
        'en': 'en',  # Inglés
        'fr': 'fr',  # Francés
        'pt': 'pt'   # Portugués
    }

    target_lang = lang_codes.get(lang, 'es')

    # Buscar en inglés y en el idioma objetivo
    sparql.setQuery(f"""
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?disease ?nameEn ?nameTarget ?abstract ?abstractTarget
        WHERE {{
            ?disease rdf:type dbo:Disease ;
                     rdfs:label ?nameEn .
            FILTER(lang(?nameEn) = "en")
            FILTER(CONTAINS(LCASE(?nameEn), LCASE("{query}")))

            OPTIONAL {{
                ?disease rdfs:label ?nameTarget .
                FILTER(lang(?nameTarget) = "{target_lang}")
            }}
            OPTIONAL {{
                ?disease dbo:abstract ?abstract .
                FILTER(lang(?abstract) = "en")
            }}
            OPTIONAL {{
                ?disease dbo:abstract ?abstractTarget .
                FILTER(lang(?abstractTarget) = "{target_lang}")
            }}
        }}
        LIMIT 15
    """)

    try:
        results = sparql.query().convert()
        diseases = []
        for binding in results['results']['bindings']:
            # Preferir nombre en el idioma objetivo, si no existe usar inglés
            name = binding.get('nameTarget', binding.get('nameEn', {})).get('value', 'Sin nombre')

            # Preferir abstract en el idioma objetivo, si no existe usar inglés
            abstract_target = binding.get('abstractTarget', {}).get('value', '')
            abstract_en = binding.get('abstract', {}).get('value', '')
            abstract_text = abstract_target if abstract_target else abstract_en

            if not abstract_text:
                abstract_text = 'Sin descripción disponible'

            diseases.append({
                'iri': binding['disease']['value'],
                'name': name,
                'name_en': binding.get('nameEn', {}).get('value', ''),
                'abstract': abstract_text[:300] + '...' if len(abstract_text) > 300 else abstract_text,
                'source': f'DBPedia Online (SPARQL) - Idioma: {lang.upper()}',
                'language': lang
            })
        return diseases
    except Exception as e:
        print(f"Error en búsqueda online DBPedia: {e}")
        return []

def storeData(entity_type, lang):
    sparql.setReturnFormat(JSON)

    names = verificate_name(entity_type)

    if type(names) == dict:
        return names

    results = []

    for name in names :
        sparql.setQuery(f"""
            PREFIX dbo: <http://dbpedia.org/ontology/>
            PREFIX dbr: <http://dbpedia.org/resource/>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

            SELECT DISTINCT ?entity (SAMPLE(?n) as ?name) (SAMPLE(?c) as ?comment) ?type
            WHERE {{
                ?entity rdfs:label "{name}"@en ;
                        rdfs:label ?n ;
                        rdfs:comment ?c .
                ?entity rdf:type ?typeClass .
                ?typeClass rdfs:label ?type .
                FILTER(lang(?type) = "en")

                OPTIONAL{{ FILTER(lang(?n) = "{lang}") }}
                OPTIONAL{{ FILTER(lang(?n) = "en") }}
                OPTIONAL{{ FILTER(lang(?c) = "{lang}") }}
                OPTIONAL{{ FILTER(lang(?c) = "en") }}
            }}
            """)

        result = sparql.query().convert()["results"]["bindings"]
        if len(result) > 0:
            results.append(result[0])
    store_in_ontology(results, entity_type)
