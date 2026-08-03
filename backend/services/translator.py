from deep_translator import GoogleTranslator

def translate_to_english(text: str) -> str:
    """
    Translates the given text (which can be in any language like Hindi, Telugu, etc.)
    to English.
    """
    try:
        translator = GoogleTranslator(source='auto', target='en')
        return translator.translate(text)
    except Exception as e:
        print(f"Translation failed: {e}")
        # If translation fails, we fallback to the original text
        return text
