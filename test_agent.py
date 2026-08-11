import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.agent import run_agent

print("Testing greeting:")
res1 = run_agent("Hello! Who are you?")
print(res1)
print("\n----------------\n")
print("Testing query:")
res2 = run_agent("What are the environmental regulations for coal mining?")
print(res2)
