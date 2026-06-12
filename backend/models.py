from pydantic import BaseModel, Field
from typing import List, Optional


# =========================
# Governance Models
# =========================

class GovernanceRequest(BaseModel):
    columns: List[str]


class ColumnGovernanceResult(BaseModel):
    column: str
    pii: bool
    risk_level: str
    risk_score: int
    tag: str


class GovernanceSummary(BaseModel):
    total_columns: int
    pii_columns: int
    high_risk_columns: int
    medium_risk_columns: int
    dataset_risk_score: float


class GovernanceResponse(BaseModel):
    results: List[ColumnGovernanceResult]
    summary: GovernanceSummary


# =========================
# Lineage Models
# =========================

class Dataset(BaseModel):
    name: str
    columns: List[str]


class LineageRequest(BaseModel):
    datasets: List[Dataset]


class Relationship(BaseModel):
    source: str
    target: str
    column: str


class NodeData(BaseModel):
    label: str


class NodePosition(BaseModel):
    x: float
    y: float


class LineageNode(BaseModel):
    id: str
    data: NodeData
    position: NodePosition


class LineageEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None


class LineageGraph(BaseModel):
    nodes: List[LineageNode]
    edges: List[LineageEdge]


class LineageResponse(BaseModel):
    relationships: List[Relationship]
    graph: LineageGraph