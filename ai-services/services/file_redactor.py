import fitz
import pandas as pd
import os


def redact_pdf(input_path, output_path, replacements):

    doc = fitz.open(input_path)

    for page in doc:

        for original, new_value in replacements.items():

            areas = page.search_for(original)

            for area in areas:

                page.add_redact_annot(area, fill=(0, 0, 0))

        page.apply_redactions()

    

    print("Writing redacted file to:", output_path)
    doc.save(output_path)
    print("file save in path:",os.path.exists(output_path))


    return output_path


def redact_txt(input_path, output_path, replacements):

    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    for original, new_value in replacements.items():
        content = content.replace(original, new_value)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    return output_path


def redact_csv(input_path, output_path, replacements):

    df = pd.read_csv(input_path)

    for original, new_value in replacements.items():
        df = df.replace(original, new_value)

    df.to_csv(output_path, index=False)

    return output_path


def redact_excel(input_path, output_path, replacements):

    df = pd.read_excel(input_path)

    for original, new_value in replacements.items():
        df = df.replace(original, new_value)

    df.to_excel(output_path, index=False)

    return output_path


def generate_redacted_file(file_path, output_path, replacements):

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return redact_pdf(file_path, output_path, replacements)

    elif ext == ".txt":
        return redact_txt(file_path, output_path, replacements)

    elif ext == ".csv":
        return redact_csv(file_path, output_path, replacements)

    elif ext in [".xls", ".xlsx"]:
        return redact_excel(file_path, output_path, replacements)

    else:
        raise Exception("Unsupported file type")