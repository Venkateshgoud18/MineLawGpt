def extract_txt(txt_path):
    with open(txt_path, "r", encoding="utf-8") as f:
        text = f.read()

    return [
        {
            "page": 1,
            "text": text
        }
    ]
