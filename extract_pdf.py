import sys
try:
    from pypdf import PdfReader
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    from pypdf import PdfReader

def main():
    try:
        reader = PdfReader(r"c:\inetpub\wwwroot\Hall_Meal-Manager\public\product list sdzhh.pdf")
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        with open("pdf_extracted.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
