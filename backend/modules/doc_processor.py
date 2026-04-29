"""
Document Processor Module
Extracts text from PDFs and plain text files.
Uses PyMuPDF if available, falls back to basic text decoding.
"""


class DocumentProcessor:
    def extract_text(self, file_bytes: bytes, filename: str = "") -> str:
        ext = filename.lower().split(".")[-1] if filename else ""

        if ext == "pdf":
            return self._extract_pdf(file_bytes)
        else:
            return self._extract_text(file_bytes)

    def _extract_pdf(self, file_bytes: bytes) -> str:
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return text.strip()
        except ImportError:
            try:
                import pdfplumber, io
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    return "\n".join(
                        page.extract_text() or "" for page in pdf.pages
                    ).strip()
            except ImportError:
                return self._extract_text(file_bytes)

    def _extract_text(self, file_bytes: bytes) -> str:
        try:
            return file_bytes.decode("utf-8").strip()
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1", errors="ignore").strip()

    def extract_keywords(self, text: str, top_n: int = 15) -> list:
        import re
        from collections import Counter

        stopwords = {
            "a","an","the","and","or","in","on","at","to","for","of",
            "with","by","is","are","was","be","this","that","it","we",
            "using","based","system","method","said","claim","wherein",
        }
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        filtered = [w for w in words if w not in stopwords]
        freq = Counter(filtered)
        return [word for word, _ in freq.most_common(top_n)]
