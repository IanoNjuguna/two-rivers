import os
import subprocess

prefix = "AcxlH"
var_name = "NEXT_PUBLIC_ALCHEMY_API_KEY"

print(f"--- Diagnosing {var_name} ---")

# 1. Check current process env
print(f"\n1. Process Environment:")
print(f"   {var_name} = {os.environ.get(var_name)}")

# 2. Check for .env files
print(f"\n2. .env file search:")
subprocess.run(["find", ".", "-name", ".env*", "-not", "-path", "*/node_modules/*"])

# 3. Search for the prefix string in all files (including hidden)
print(f"\n3. Grepping for '{prefix}' (exhaustive):")
subprocess.run(["grep", "-r", "-l", prefix, ".", "--include=.*", "--exclude-dir=.git", "--exclude-dir=node_modules"])

# 4. Search for the variable name assignments
print(f"\n4. Grepping for '{var_name}' assignments:")
subprocess.run(["grep", "-r", var_name, ".", "--include=.*", "--exclude-dir=.git", "--exclude-dir=node_modules"])

# 5. Check if it's in the shell config (more thorough)
print(f"\n5. Shell config check:")
subprocess.run(["grep", "-E", f"{var_name}|{prefix}", os.path.expanduser("~/.bashrc"), os.path.expanduser("~/.zshrc"), os.path.expanduser("~/.profile")], stderr=subprocess.DEVNULL)
