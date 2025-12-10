from owlready2 import *
from preprocess import preprocess
from translator import translate

# Cache para traducciones en restructure
_trans_cache = {}

def cached_translate(text, dest='es'):
    """Traducción con caché"""
    if not text:
        return text
    key = (str(text), dest)
    if key not in _trans_cache:
        _trans_cache[key] = translate(text, dest)
    return _trans_cache[key]

def struct_class(ontoClass):
    """
    Recursively constructs a hierarchy of subclasses for a given ontology class.

    Parameters:
    ontoClass (owlready2.entity.ThingClass): The ontology class for which to construct the hierarchy.

    Returns:
    list: A list of dictionaries representing the hierarchy. Each dictionary contains:
        - 'name_class': The name of the subclass.
        - 'sub_class': The hierarchical structure of the subclass.
    """
    herarchy = []
    for subclass in ontoClass.subclasses() :
        herarchy.append({
            "name_class" : subclass.name,
            "sub_class" : struct_class(subclass)
            })
    return herarchy

def struct_individuals(individual, classOntology, lang):
    """
    Retrieve instances of a specified class from the ontology and structure them into a list of dictionaries.
    """
    instances = []
    # Cachear traducción del nombre de clase (solo una vez)
    class_name_translated = cached_translate(preprocess(classOntology.name), dest=lang)

    for individual in classOntology.instances():
        nombre_prop = getNombreProp(individual, individual.get_properties())
        nombre = nombre_prop[0] if nombre_prop and nombre_prop != "No se encontro" else individual.name

        instances.append({
            "iri" : individual.iri,
            "name_class": class_name_translated,
            "name_individual": cached_translate(preprocess(nombre), dest=lang),
            "properties" : struct_properties(individual, lang),
            "sample_name": individual.name,
            "name_individual_o": nombre,
        })
    return instances

def struct_properties(ontoIndividual, lang):
    """
    Funcion recursiva para obtener todas las propiedades de una instancia de una clase
    """
    properties = ontoIndividual.get_properties() if ontoIndividual else None
    herarchy = []

    if properties == None:
        return []

    for value in properties:
        if "object" in str.lower(str(type(value))):
            individual_temp = getattr(ontoIndividual, value.name, None)[0]
            nombre_prop = getNombreProp(individual_temp, individual_temp.get_properties())
            nombre = nombre_prop[0] if nombre_prop and nombre_prop != "No se encontro" else ""
            herarchy.append({
                "relationship" : {
                    "iri" : value.iri,
                    "name_object": cached_translate(preprocess(nombre), dest=lang),
                    "properties": struct_properties(individual_temp, lang)
                }})
        else:
            if "nombre" not in str(value.name):
                prop_value = getattr(ontoIndividual, value.name, None)
                if prop_value:
                    herarchy.append({
                        value.name : cached_translate(preprocess(str(prop_value[0])), dest=lang)
                    })
    return herarchy

def getNombreProp(individual, properties):
    """
    Retrieves the value of a property with "nombre" in its name from an individual's properties.

    Args:
        individual: The ontology individual whose properties are being inspected.
        properties: A collection of properties belonging to the individual.

    Returns:
        The value of the property containing "nombre" in its name if found, otherwise returns "No se encontro".
        If properties is None, returns an empty list.
    """
    if properties == None:
        return []
    for propertie in properties:
        if "nombre" in str.lower(str(propertie.name)):
            return getattr(individual, propertie.name, None)
    return "No se encontro"
    