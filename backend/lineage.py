from collections import defaultdict
from typing import Dict, List


def detect_relationships(datasets: List[Dict]) -> List[Dict]:
    """
    Detect relationships based on shared column names.

    Input:

    [
        {
            "name": "customers",
            "columns": ["customer_id", "email"]
        },
        {
            "name": "orders",
            "columns": ["customer_id", "amount"]
        }
    ]

    Output:

    [
        {
            "source": "customers",
            "target": "orders",
            "column": "customer_id"
        }
    ]
    """

    relationships = []

    column_map = defaultdict(list)

    # Build mapping:
    # customer_id -> [customers, orders]
    for dataset in datasets:
        dataset_name = dataset["name"]

        for column in dataset["columns"]:
            column_map[column.lower()].append(dataset_name)

    # Create relationships
    for column_name, tables in column_map.items():

        if len(tables) > 1:

            for i in range(len(tables)):
                for j in range(i + 1, len(tables)):

                    relationships.append(
                        {
                            "source": tables[i],
                            "target": tables[j],
                            "column": column_name,
                        }
                    )

    return relationships


def build_lineage_graph(datasets: List[Dict]) -> Dict:
    """
    Generate React Flow compatible graph.

    Returns:

    {
        "nodes": [...],
        "edges": [...]
    }
    """

    relationships = detect_relationships(datasets)

    nodes = []
    edges = []

    # Create dataset nodes
    for dataset in datasets:

        nodes.append(
            {
                "id": dataset["name"],
                "data": {
                    "label": dataset["name"]
                },
                "position": {
                    "x": 0,
                    "y": 0
                }
            }
        )

    # Create relationship edges
    for index, relationship in enumerate(relationships):

        edges.append(
            {
                "id": f"edge-{index}",
                "source": relationship["source"],
                "target": relationship["target"],
                "label": relationship["column"],
            }
        )

    return {
        "nodes": nodes,
        "edges": edges,
    }


def generate_lineage_summary(datasets: List[Dict]) -> Dict:
    """
    Generate quick lineage statistics
    for dashboard cards.
    """

    relationships = detect_relationships(datasets)

    return {
        "datasets": len(datasets),
        "relationships": len(relationships),
        "connected_datasets": len(
            set(
                [
                    rel["source"]
                    for rel in relationships
                ]
                +
                [
                    rel["target"]
                    for rel in relationships
                ]
            )
        ),
    }


if __name__ == "__main__":

    sample_datasets = [
        {
            "name": "customers",
            "columns": [
                "customer_id",
                "email",
                "country",
            ],
        },
        {
            "name": "orders",
            "columns": [
                "order_id",
                "customer_id",
                "amount",
            ],
        },
        {
            "name": "payments",
            "columns": [
                "payment_id",
                "customer_id",
                "amount",
            ],
        },
    ]

    print("\nRelationships\n")
    print(detect_relationships(sample_datasets))

    print("\nLineage Graph\n")
    print(build_lineage_graph(sample_datasets))

    print("\nSummary\n")
    print(generate_lineage_summary(sample_datasets))