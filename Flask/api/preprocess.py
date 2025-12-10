import spacy
import re

from rapidfuzz import fuzz, utils

nlp = spacy.load("es_core_news_sm")

def preprocess(s: str):
    """
    Preprocess strings with nlp techniques
    
    Parameters
    ----------
    s: str
        string to process

    Returns
    -------
    str
        string processed 
    """
    s = s.replace('_', ' ')
    s = remove_punctuation(s)
    doc = nlp(s)    
    processed_words = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]
    
    return ' '.join(processed_words)

def remove_punctuation(s: str):
    """
    Remove all punctuation signs from a string

    Parameters
    ----------
    s: str
        string to process

    Returns
    -------
    str
        cleaned string 
    """ 
    return re.sub(r'[^\w\s]', '', s)

def match(s: str, t: str):
    """
    Calculates the fuzzy match between two strings.

    Parameters:
        s (str): The string to match against.
        t (str): The string to match.

    Returns:
        float: The fuzzy match score (0-100) between the strings.
    """
    return fuzz.partial_ratio(t, s, processor=utils.default_process)
