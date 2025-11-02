import json
from textwrap import indent

def dumps_multiline(obj, elements_per_line=3, indent_level=2):
    def format_list(lst, level):
        if not lst:
            return "[]"
        chunks = [lst[i:i+elements_per_line] for i in range(0, len(lst), elements_per_line)]
        inner_indent = " " * indent_level * (level + 1)
        lines = []
        for chunk in chunks:
            line = ", ".join(json.dumps(el) for el in chunk)
            lines.append(inner_indent + line)
        return "[\n" + ",\n".join(lines) + "\n" + (" " * indent_level * level) + "]"

    def format_value(value, level=0):
        if isinstance(value, dict):
            if not value:
                return "{}"

            # Sort keys numerically if possible, otherwise lexicographically
            def sort_key(k):
                try:
                    return int(k)
                except ValueError:
                    return k

            items = []
            for k in sorted(value.keys(), key=sort_key):
                items.append(
                    f'"{k}": {format_value(value[k], level + 1)}'
                )
            return "{\n" + indent((",\n".join(items)), " " * indent_level) + "\n}"
        elif isinstance(value, list):
            return format_list(value, level)
        else:
            return json.dumps(value)

    return format_value(obj, 0)

data = {}

with open('./tools/google-10000-english-no-swears.txt', 'r') as f:
    words = f.read().splitlines()

for word in words:
    length = len(word)
    if length not in data:
        data[length] = []
    data[length].append(word)

json_str = dumps_multiline(data, elements_per_line=4, indent_level=4)
with open('./public/wordbank.json', 'w') as f:
    f.write(json_str)