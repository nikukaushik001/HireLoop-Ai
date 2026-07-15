import time
print("Start importing...")

print("Importing langchain_groq...")
t = time.time()
from langchain_groq import ChatGroq
print(f"Done langchain_groq in {time.time() - t:.2f}s")

print("Importing langchain_core.prompts...")
t = time.time()
from langchain_core.prompts import PromptTemplate
print(f"Done langchain_core.prompts in {time.time() - t:.2f}s")

print("Importing langchain_core.output_parsers...")
t = time.time()
from langchain_core.output_parsers import JsonOutputParser
print(f"Done langchain_core.output_parsers in {time.time() - t:.2f}s")

print("Importing pydantic...")
t = time.time()
from pydantic import BaseModel, Field
print(f"Done pydantic in {time.time() - t:.2f}s")

print("Imports completed successfully!")
