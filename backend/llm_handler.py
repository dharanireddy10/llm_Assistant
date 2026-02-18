import os
import json
from dotenv import load_dotenv
from groq import Groq
from memory import add_message, get_memory

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are an expert AI assistant.

You MUST ALWAYS respond ONLY in valid JSON.

JSON format:
{
  "part_a": "definition",
  "part_b": "explanation",
  "part_c": "examples",
  "summary": "short summary"
}

Rules:
- Always answer based on user's original question.
- Always correct factual errors when feedback is provided.
- If feedback refers to specific part, modify ONLY that part.
- Keep other parts unchanged.
- Never output anything outside JSON.
"""


# safer JSON enforcement
def safe_json_parse(text):
    try:
        return json.loads(text)
    except:
        # attempt auto-fix
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])


def call_llm(user_prompt):

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0
    )

    content = response.choices[0].message.content

    parsed = safe_json_parse(content)

    return json.dumps(parsed, indent=2)


def generate_response(user_input):

    memory = get_memory()

    prompt = "Conversation history:\n"

    for msg in memory:
        prompt += f"{msg['role']}: {msg['content']}\n"

    prompt += f"""
Original user question:
{user_input}

Generate accurate structured response.
"""

    output = call_llm(prompt)

    add_message("user", user_input)
    add_message("assistant", output)

    return output


def handle_feedback(feedback):

    memory = get_memory()

    if len(memory) < 2:
        return call_llm("No previous response available.")

    last_question = None
    last_response = None

    for msg in reversed(memory):
        if msg["role"] == "assistant" and not last_response:
            last_response = msg["content"]
        elif msg["role"] == "user" and not last_question:
            last_question = msg["content"]

        if last_question and last_response:
            break

    prompt = f"""
Original user question:
{last_question}

Previous JSON response:
{last_response}

User feedback:
{feedback}

Instructions:

1. Identify which part (part_a, part_b, part_c, summary) feedback refers to.
2. Modify ONLY that part based on feedback.
3. Keep other parts EXACTLY same.
4. Return FULL corrected JSON.

Return ONLY JSON.
"""

    output = call_llm(prompt)

    add_message("user", feedback)
    add_message("assistant", output)

    return output
