from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.get("/llm-help")
def llm_help(question: str, answers: str):
    answers_list = answers.split(",")
    formatted_answers = "\n".join(f"{i+1}. {ans.strip()}" for i, ans in enumerate(answers_list))

    prompt = f"""אתה עוזר בטריוויה. תבחר את התשובה הנכונה לשאלה הבאה:

שאלה: {question}

אפשרויות:
{formatted_answers}

תכתוב רק את התשובה שנראית לך הכי נכונה, בלי הסברים.
"""

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        suggestion = response.text.strip()
    except Exception as e:
        print(f"שגיאה מה-LLM: {e}")
        suggestion = "לא הצלחתי לקבל תשובה"

    return {"suggestion": suggestion}
