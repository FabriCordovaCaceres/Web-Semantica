from mtranslate import translate as Translate
#from googletrans import Translator
def translate(text, dest): 
	return Translate(text, dest)