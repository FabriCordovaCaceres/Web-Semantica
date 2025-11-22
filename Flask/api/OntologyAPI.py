# Decorators for api routes
from flask import Flask, abort, request
# JSON format for responses
from flask import jsonify
# NLP processing
from preprocess import preprocess
# Ontology searches: local and external (DBPedia)
import ontology
import dbpedia
# Google Translator API
from translator import translate as translate_
# Structure output format
from restructure import struct_class
# CORS web
from flask_cors import CORS
# Paralelismo
from concurrent.futures import ThreadPoolExecutor, as_completed

def create_app():
    app = Flask(__name__)
    return app

app = create_app()
CORS(app)

# Pool de threads para búsquedas paralelas
executor = ThreadPoolExecutor(max_workers=2)

""" API ROUTES """
@app.route('/searchClass', methods=['GET'])
def searchClass(): 
    query=  request.args['query']
    #query = translate_(request.args['query'], dest='es')
    lang = request.args['lang']
    if query is None: 
        abort(404, f"Class {query} not exists")
    return jsonify(ontology.getInstancesByClass(query, lang))

@app.route('/search', methods=['GET'])
def search():
    query = preprocess(request.args['query'])
    lang = request.args['lang']

    if query is None:
        return jsonify({'error': 'Must have a query'})

    # Pre-procesar traducciones una sola vez
    query_en = preprocess(translate_(query, dest='en'))
    query_es = preprocess(translate_(query, dest='es'))

    # Ejecutar búsquedas en paralelo
    future_dbpedia = executor.submit(dbpedia.searchDBPedia, query_en)
    future_ontology = executor.submit(ontology.search, query_es)

    # Esperar resultados
    result = future_ontology.result()
    result_dbpedia = future_dbpedia.result()

    if len(result_dbpedia) != 0:
        result['DOID.dbpedia.Disease'] = result_dbpedia

    if len(result) == 0:
        msg = translate_('No existen busquedas encontradas', dest=lang)
        result[msg] = []

    return result
    
@app.route('/searchOnline', methods=['GET'])
def searchOnline():
    """
    BÚSQUEDA ONLINE: Consulta en tiempo real al endpoint SPARQL de DBPedia.
    Requiere conexión a internet.
    """
    query = request.args.get('query', '')
    lang = request.args.get('lang', 'es')

    if not query:
        return jsonify({'error': 'Se requiere un parámetro query'})

    # Traducir query al inglés para mejor búsqueda en DBPedia
    query_en = translate_(query, dest='en')

    # Búsqueda online a DBPedia
    result_online = dbpedia.searchDBPediaOnline(query_en, lang)

    return jsonify({
        'source': 'DBPedia Online (SPARQL Endpoint)',
        'query': query,
        'results': result_online,
        'count': len(result_online)
    })

@app.route('/searchOffline', methods=['GET'])
def searchOffline():
    """
    BÚSQUEDA OFFLINE: Busca en el caché local de 500 enfermedades
    descargadas de DBPedia al iniciar la aplicación.
    No requiere conexión a internet.
    """
    query = preprocess(request.args.get('query', ''))
    lang = request.args.get('lang', 'es')

    if not query:
        return jsonify({'error': 'Se requiere un parámetro query'})

    # Búsqueda offline en caché local
    result_offline = dbpedia.searchDBPedia(query)

    return jsonify({
        'source': 'DBPedia Offline (Caché Local - 500 enfermedades)',
        'query': query,
        'results': result_offline,
        'count': len(result_offline)
    })

@app.route('/addition', methods=['GET'])
def route_addition():
    query = request.args['query']

    # return jsonify(ontology.getClassesOntologie())
    return jsonify(dbpedia.storeData(translate_(query, dest='en'), request.args['lang']))
    # return jsonify(dbpedia.verificate_name(query))

def translate(result, lang):
    for class_ in result.keys():
        class_instances = result[class_]
        for i in range(len(class_instances)):
            instance = class_instances[i]
            for key in instance.keys():
                if key=='iri' or key=='name_individual' or key=='sample_name': continue
                result[class_][i][key] = translate_(result[class_][i][key], dest=lang)    
    return result

if __name__ == '__main__' :
    app.run(debug=True)
