from owlready2 import *
from pathlib import Path
from mtranslate import translate
from functools import lru_cache

from restructure import *
from preprocess import preprocess, match as fuzzymatch

path = Path(__file__).parent.resolve()
path = path.parent.parent
path = path/"resourse/ontology.owx"

ontologie = get_ontology(str(path)).load()

# Cache para traducciones
_translation_cache = {}

def cached_translate(text, dest='es'):
	"""Traducción con caché en memoria"""
	key = (text, dest)
	if key not in _translation_cache:
		_translation_cache[key] = translate(text, dest)
	return _translation_cache[key]

def getClassesOntologie():
	"""
	Retrieve all classes and their subclasses from the ontology.
	"""
	clasess = []
	for classOntology in ontologie.classes():
		if classOntology.name not in str(clasess) :
			clasess.append(classOntology.name)
	return clasess

name_classes = getClassesOntologie()

# Pre-construir índice de búsqueda al iniciar
_search_index = None

def build_search_index():
	"""Construye un índice en memoria para búsquedas rápidas"""
	global _search_index
	if _search_index is not None:
		return _search_index

	_search_index = []
	for individual in ontologie.individuals():
		class_name = str(list(individual.is_a)[0])
		nombre_prop = getNombreProp(individual, individual.get_properties())
		nombre = nombre_prop[0] if nombre_prop and nombre_prop != "No se encontro" else individual.name

		# Recolectar todos los valores de propiedades
		searchable_values = []
		for propertie in individual.get_properties():
			values = getattr(individual, propertie.name, None)
			if values:
				for value in values:
					searchable_values.append(preprocess(str(value)))

		_search_index.append({
			'individual': individual,
			'class_name': class_name,
			'nombre': nombre,
			'searchable': ' '.join(searchable_values)
		})

	print(f"Índice construido con {len(_search_index)} individuos")
	return _search_index

# Construir índice al cargar el módulo
build_search_index()

def search(query: str):
	"""
	Búsqueda optimizada usando índice pre-construido.
	"""
	results = {}
	index = build_search_index()

	for entry in index:
		# Buscar en el texto pre-procesado
		match_score = fuzzymatch(entry['searchable'], query)
		if match_score >= 50.0:
			class_name = entry['class_name']
			if class_name not in results:
				results[class_name] = []

			# Usar caché para traducciones
			nombre = entry['nombre']
			results[class_name].append({
				'name': cached_translate(nombre, dest='es'),
				'iri': entry['individual'].iri,
				'name_individual': nombre,
				'sample_name': entry['individual'].name
			})

	return results

def get(iri: str):
	"""
	Retrieve an item from the ontology by its IRI.

	Parameters:
		iri (str): The IRI of the item to retrieve.

	Returns:
		An instance of the item in the ontology with the given IRI.
	"""
	return ontologie[iri[iri.find('#'):]] # aqui deberia estar el cuerpo completo de un item basado en su iri

def getInstancesByClass(name: str, lang: str): 
	"""
	Retrieve instances of a specified class from the ontology.

	Parameters:
		name (str): The name of the class in the ontology to retrieve instances for.
		lang (str): Language to translate the results

	Returns:
		list: A list of dictionaries, each representing an instance of the specified class.
			Each dictionary contains the 'iri', 'name_class', 'name_individual', and 'properties'
			of the individual. Returns an empty list if the class is not found.
	"""
	class_ = getattr(ontologie, name, None)
	if class_ is None: 
		return []
	return struct_individuals(class_.instances(), class_, lang)

def store_in_ontology(items_list, query):
	class_mapping = {
		"drug": {
			"class": "Tratamiento_medico",
			"name_prop": "nombre_tratamiento_medico",
			"desc_prop": "funcion_tratamiento_medico"
		},
		"disease": {
			"class": "Cancer",
			"name_prop": "cancer_nombre",
			"desc_prop": "fases_del_cancer"
		},
		"organization": {
			"class": "Centro_medico",
			"name_prop": "nombre_centro_medico",
			"desc_prop": "descripcion_centro_medico"
		},
		"food": {
			"class": "Alimento_Permitido",
			"name_prop": "alimento_nombre",
			"desc_prop": "descripcion_alimento"
		}
	}

	try:
		with ontologie: 
			for item in items_list:
				item_type = str(item.get('type', {}).get('value', '')).lower()
				
				if item_type in class_mapping:
					mapping = class_mapping[item_type]
					
					onto_class = ontologie.search_one(iri=f"*#{mapping['class']}")
					if not onto_class:
						print(f"Clase no encontrada: {mapping['class']}")
						continue
					
					try:
						new_individual = onto_class()
						
						if 'name' in item and mapping['name_prop']:
							setattr(new_individual, mapping['name_prop'], 
									item['name']['value'])
						
						if 'comment' in item and mapping['desc_prop']:
							setattr(new_individual, mapping['desc_prop'], 
									item['comment']['value'])
							
						print(f"Creado individuo de tipo {item_type}: {item.get('name', {}).get('value', 'Sin nombre')}")
					
					except Exception as e:
						print(f"Error al crear individuo de tipo {item_type}: {str(e)}")
				else:
					print(f"Tipo no reconocido: {item_type}")
					
		ontologie.save(file=str(path))
	except Exception as e:
		return {"error": 500, "message": f"Error al guardar en la ontología: {str(e)}"}

	return search(query);