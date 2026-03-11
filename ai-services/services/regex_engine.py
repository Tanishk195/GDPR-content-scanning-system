import re
from config.db import fetch_enabled_rules


def run_regex_detection(text: str):

    violations = []

    rules = fetch_enabled_rules()

    for rule in rules:

        rule_id = rule["id"]
        rule_name = rule["rule_name"]
        pattern = rule["regex_pattern"]

        try:

            matches = re.findall(pattern, text)

            for match in matches:

                violations.append({
                    "rule_id": rule_id,
                    "type": rule_name,
                    "value": match
                })

        except re.error:
            continue

    return violations