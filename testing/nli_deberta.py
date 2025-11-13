from sentence_transformers import CrossEncoder
from pathlib import Path

model = CrossEncoder('cross-encoder/nli-deberta-v3-large')

source_path = Path(__file__).resolve().parent / 'derm_foundation_website.md'
generated_path = Path(__file__).resolve().parent / 'generated_derm_foundation.md'

input1 = source_path.read_text(encoding='utf-8')
input2 = generated_path.read_text(encoding='utf-8')
scores = model.predict([(input1, input2)])

#Convert scores to labels
label_mapping = ['contradiction', 'entailment', 'neutral']
labels = [label_mapping[score_max] for score_max in scores.argmax(axis=1)]
print(labels, scores)