from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SQLDatabase 
from langchain_community.agent_toolkits import create_sql_agent
from langchain.tools import tool 
from langchain.agents import create_agent
import pyodbc
from urllib.parse import quote_plus
from flask import Flask, request, jsonify

# DB connection
server = 'YWUEMSMUCH\SQLEXPRESS'
database = 'bca'
username = 'chatbot_user'
password = 'Chatbot123@'
driver = 'ODBC Driver 18 for SQL Server'

try:
    conn = pyodbc.connect(
        f'DRIVER={{{driver}}};SERVER={server};DATABASE={database};UID={username};PWD={password};Encrypt=no'
    )
    print("✅ Connection successful!")
except Exception as e:
    print("❌ Connection failed:")
    print(e)


# declare models

api_key = "AIzaSyBFseiM9f_xVIy0bIvzHjJ2XJ7A46ewa_I"

flash_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=api_key)

pro_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    google_api_key=api_key)


params = quote_plus(
    f"DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password};Encrypt=no;TrustServerCertificate=yes"
)

db_url = f"mssql+pyodbc:///?odbc_connect={params}"
db = SQLDatabase.from_uri(db_url)
print("✅ SQLDatabase connected successfully!")

# create agent 
flash_agent = create_sql_agent(
    flash_model,
    db = db,
    verbose=True
)
pro_agent = create_sql_agent(
    pro_model,
    db = db,
    verbose=True
)

# test agent
# query = "What categories do you have ?"
# result = flash_agent.run(query)


# --- Classifier LLM ---
classifier_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=api_key)


def classify_question(question: str) -> str:
    """
    Use LLM to decide if a question is 'db' or 'general'.
    """
    prompt = f"""
        You are a classifier. Decide if the user's question should be answered using the database about shopping ('db') 
        or by general knowledge ('general'). Respond with exactly one word: 'db' or 'general'.

        Question: {question}
        """
    response = classifier_llm.invoke(prompt)
    text = response.content  # AIMessage.content
    print(f"Classifier response: {text}")
    return text.lower().strip()


# --- Router ---
def ask_agent(question: str) -> str:
    question_type = classify_question(question) 
    if question_type == "db":
        return flash_agent.run(question)
    else:   
        return flash_model.invoke(question).content



#print(ask_agent("How many categories of products do we have?")) 
#print(ask_agent("how do you think about t1 vs kt this sunday's match?")) 

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    question = data["question"]
    print(f"Received question: {question}")
    answer = ask_agent(question)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True) 