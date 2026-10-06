cd /Users/mfenqin/workspace/OpenSearch-Dashboards/plugins/dashboards-search-relevance/server/sample_data/data && \
python3 << 'EOF'
import gzip
import json
import subprocess

bulk_data = []
with gzip.open('ubi_ecommerce_products.json.gz', 'rt') as f:
    for line in f:
        doc = json.loads(line)
        doc_id = doc.pop('_id', doc.get('asin'))
        bulk_data.append(json.dumps({"index": {"_index": "knn_sample_ubi_ecommerce_products", "_id": doc_id}}))
        bulk_data.append(json.dumps(doc))

# Write to temp file
with open('/tmp/bulk_data.ndjson', 'w') as f:
    f.write('\n'.join(bulk_data) + '\n')

print(f"Prepared {len(bulk_data)//2} documents")
EOF

curl -s -XPOST "http://localhost:9200/_bulk?pipeline=title_embedding_pipeline" \
  -H 'Content-Type: application/x-ndjson' \
  --data-binary @/tmp/bulk_data.ndjson | jq '{took, errors, items: .items | length}'