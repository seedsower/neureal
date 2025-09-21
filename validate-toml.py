#!/usr/bin/env python3
import sys

try:
    import tomllib
except ImportError:
    try:
        import tomli as tomllib
    except ImportError:
        print("Installing tomli for TOML validation...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tomli"])
        import tomli as tomllib

def validate_toml(filename):
    try:
        with open(filename, 'rb') as f:
            data = tomllib.load(f)
        print(f"✅ {filename} is valid TOML!")
        print(f"📊 Parsed sections: {list(data.keys())}")
        return True
    except Exception as e:
        print(f"❌ {filename} has TOML syntax errors:")
        print(f"   Error: {e}")
        return False

if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "netlify.toml"
    validate_toml(filename)
