import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

print("Running SchemaSense Backend Smoke Test...")

try:
    from app import app, health, governance_scan, lineage_build, get_governance_results, get_lineage_relationships
    from models import GovernanceRequest, LineageRequest, Dataset
    from governance import scan_dataset_columns
    from lineage import detect_relationships
    from database import db
except Exception as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

# Test 1: Health check
print("Testing health check...")
health_res = health()
assert health_res["status"] == "ok"
print("✓ Health check OK")

# Test 2: Database Initialization
print("Testing database connectivity...")
assert db is not None
print("✓ Database Initialized OK")

# Test 3: Governance Scan Functions
print("Testing governance scan execution...")
cols = ["cust_id", "email", "country"]
scan_res = scan_dataset_columns(cols)
assert len(scan_res) == 3
assert any(r["pii"] for r in scan_res)  # email is pii
print("✓ Governance scanning logic OK")

# Test 4: Endpoint testing with models
print("Testing Governance API endpoint...")
gov_req = GovernanceRequest(columns=["cust_id", "email"])
gov_res = governance_scan(gov_req)
assert len(gov_res.results) == 2
assert gov_res.summary.pii_columns == 1
print("✓ Governance scan endpoint logic OK")

# Test 5: Lineage relationships detection
print("Testing Lineage logic...")
datasets = [
    {"name": "customers", "columns": ["cust_id", "email"]},
    {"name": "orders", "columns": ["order_id", "cust_id"]}
]
rel_res = detect_relationships(datasets)
assert len(rel_res) == 1
assert rel_res[0]["source"] == "customers"
assert rel_res[0]["target"] == "orders"
print("✓ Lineage logic OK")

# Test 6: Lineage api model endpoint testing
print("Testing Lineage API endpoint...")
lin_req = LineageRequest(datasets=[
    Dataset(name="customers", columns=["cust_id", "email"]),
    Dataset(name="orders", columns=["order_id", "cust_id"])
])
lin_res = lineage_build(lin_req)
assert len(lin_res.relationships) == 1
print("✓ Lineage build endpoint logic OK")

# Test 7: Historical Results fetching
print("Testing historical collection retrieving...")
gov_hist = get_governance_results()
assert "results" in gov_hist
lin_hist = get_lineage_relationships()
assert "relationships" in lin_hist
print("✓ History retrieval OK")

print("\n🎉 Backend Smoke Test: ALL CLEAR! All checks passed successfully in dev_reema.")
