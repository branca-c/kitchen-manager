import os
import google.generativeai as genai
from django.conf import settings
import json
import re
from dotenv import load_dotenv

# Carichiamo le variabili d'ambiente
load_dotenv()

class AIService:
    """
    Service Layer per gestire l'integrazione con Google Gemini.
    Isola la logica AI dal resto del framework Django.
    """
    
    @staticmethod
    def analyze_reviews(reviews_queryset):
        # 1. Recupero configurazione (da settings o .env)
        api_key = getattr(settings, 'GEMINI_API_KEY', os.getenv("GEMINI_API_KEY"))
        
        if not api_key:
            return {"error": "Configurazione AI mancante. Verificare GEMINI_API_KEY."}

        # 2. Configurazione del modello (Utilizziamo gemini-2.5-flash come da test)
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')

        # 3. Preparazione dei dati delle recensioni
        data_text = "\n".join([
            f"- Valutazione {r.rating}/5: {r.comment}" 
            for r in reviews_queryset if r.comment
        ])

        if not data_text:
            return {"error": "Non ci sono recensioni con commenti da analizzare."}

        # 4. Prompt Engineering raffinato
        prompt = f"""
        Sei un analista esperto del progetto 'Kitchen Manager'.
        Analizza questi feedback dei clienti e restituisci ESCLUSIVAMENTE un oggetto JSON.
        
        Feedback da analizzare:
        {data_text}
        
        Struttura JSON richiesta:
        {{
          "sentiment_score": 1-10,
          "main_complaint": "descrizione sintetica della lamentela principale o null",
          "top_dish": "nome del piatto più apprezzato o null",
          "advice": "consiglio pratico per lo chef per migliorare"
        }}
        """

        try:
            # 5. Chiamata all'API
            response = model.generate_content(prompt)
            raw_text = response.text
            
            # 6. Parsing robusto del JSON
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            
            if json_match:
                return json.loads(json_match.group())
            
            return {"error": "L'IA non ha restituito un formato JSON valido."}

        except Exception as e:
            return {"error": f"Errore durante l'analisi AI: {str(e)}"}