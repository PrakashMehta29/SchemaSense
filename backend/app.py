from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    GovernanceRequest,
    GovernanceResponse,
    LineageRequest,
    LineageResponse,
    ConnectionToggleRequest,
    ConnectionDetail,
)

from governance import (
    scan_dataset_columns,
    generate_governance_summary,
)

from lineage import (
    detect_relationships,
    build_lineage_graph,
)

from database import db

app = FastAPI(
    title="SchemaSense API",
    description="Governance and Lineage Backend",
    version="1.0.0",
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace later with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "SchemaSense Governance & Lineage API",
    }


@app.post(
    "/governance/scan",
    response_model=GovernanceResponse,
)
def governance_scan(payload: GovernanceRequest):
    """
    Scan dataset columns for:
    - PII
    - Governance tags
    - Risk scores
    """

    try:
        results = scan_dataset_columns(payload.columns)
        summary = generate_governance_summary(results)

        # Persist results in DuckDB database
        for res in results:
            db.save_governance_result(
                column_name=res["column"],
                pii=res["pii"],
                risk=res["risk_level"],
                risk_score=res["risk_score"],
                tag=res["tag"]
            )

        return GovernanceResponse(
            results=results,
            summary=summary,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Governance scan failed: {str(e)}",
        )


@app.get("/governance/results")
def get_governance_results():
    """
    Retrieve all historical governance scan results from the database.
    """
    try:
        raw_results = db.get_governance_results()
        results = []
        for row in raw_results:
            results.append({
                "id": row[0],
                "column_name": row[1],
                "pii": row[2],
                "risk": row[3],
                "risk_score": row[4],
                "tag": row[5]
            })
        return {"results": results}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch governance results: {str(e)}",
        )


@app.post(
    "/lineage/build",
    response_model=LineageResponse,
)
def lineage_build(payload: LineageRequest):
    """
    Build lineage graph from datasets.
    """

    try:
        datasets = [d.model_dump() for d in payload.datasets]
        relationships = detect_relationships(datasets)
        graph = build_lineage_graph(datasets)

        # Persist lineage relationships in DuckDB database
        for rel in relationships:
            db.save_lineage_relationship(
                source_dataset=rel["source"],
                target_dataset=rel["target"],
                shared_column=rel["column"]
            )

        return LineageResponse(
            relationships=relationships,
            graph=graph,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lineage generation failed: {str(e)}",
        )


@app.get("/lineage/relationships")
def get_lineage_relationships():
    """
    Retrieve all historical lineage relationships from the database.
    """
    try:
        raw_relationships = db.get_lineage_relationships()
        relationships = []
        for row in raw_relationships:
            relationships.append({
                "id": row[0],
                "source_dataset": row[1],
                "target_dataset": row[2],
                "shared_column": row[3]
            })
        return {"relationships": relationships}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch lineage relationships: {str(e)}",
        )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "modules": [
            "governance",
            "lineage",
        ],
    }


@app.get("/connections")
def get_connections():
    """
    Retrieve all database connection statuses.
    """
    try:
        raw_rows = db.get_connections()
        results = []
        for r in raw_rows:
            results.append({
                "name": r[0],
                "status": r[1],
                "host": r[2],
                "port": r[3],
                "db_name": r[4],
                "username": r[5],
            })
        return {"connections": results}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch connections: {str(e)}",
        )


@app.post("/connections/toggle")
def toggle_connection(payload: ConnectionToggleRequest):
    """
    Connect or disconnect a database.
    """
    try:
        db.save_connection(
            name=payload.name,
            status=payload.status,
            host=payload.host,
            port=payload.port,
            db_name=payload.db_name,
            username=payload.username,
        )
        return {
            "success": True,
            "message": f"Connection {payload.name} updated to {payload.status}",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to toggle connection: {str(e)}",
        )
