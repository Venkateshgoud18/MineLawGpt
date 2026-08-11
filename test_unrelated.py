import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from services.agent import run_agent

print(run_agent("What is the capital of France?"))
print(run_agent("How do I bake a chocolate cake?"))
