import duckdb
from pathlib import Path

DB_PATH = "schemasense.db"


class Database:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.conn = duckdb.connect(db_path)

    def initialize(self):
        """
        Create required tables if they do not exist.
        """

        # Create sequences for auto-increment
        self.conn.execute("CREATE SEQUENCE IF NOT EXISTS seq_governance_results;")
        self.conn.execute("CREATE SEQUENCE IF NOT EXISTS seq_lineage_relationships;")

        # Create table for database connections
        self.conn.execute("""
        CREATE TABLE IF NOT EXISTS database_connections (
            name VARCHAR PRIMARY KEY,
            status VARCHAR,
            host VARCHAR,
            port INTEGER,
            db_name VARCHAR,
            username VARCHAR
        )
        """)

        # Check if we need to recreate the governance_results table to apply the schema change
        recreate_gov = True
        try:
            res = self.conn.execute(
                "SELECT column_default FROM information_schema.columns WHERE table_name = 'governance_results' AND column_name = 'id'"
            ).fetchone()
            if res and res[0] is not None:
                recreate_gov = False
        except Exception:
            pass

        if recreate_gov:
            self.conn.execute("DROP TABLE IF EXISTS governance_results;")

        self.conn.execute("""
        CREATE TABLE IF NOT EXISTS governance_results (
            id INTEGER DEFAULT nextval('seq_governance_results') PRIMARY KEY,
            column_name VARCHAR,
            pii BOOLEAN,
            risk VARCHAR,
            risk_score INTEGER,
            tag VARCHAR
        )
        """)

        # Check if we need to recreate the lineage_relationships table to apply the schema change
        recreate_lin = True
        try:
            res = self.conn.execute(
                "SELECT column_default FROM information_schema.columns WHERE table_name = 'lineage_relationships' AND column_name = 'id'"
            ).fetchone()
            if res and res[0] is not None:
                recreate_lin = False
        except Exception:
            pass

        if recreate_lin:
            self.conn.execute("DROP TABLE IF EXISTS lineage_relationships;")

        self.conn.execute("""
        CREATE TABLE IF NOT EXISTS lineage_relationships (
            id INTEGER DEFAULT nextval('seq_lineage_relationships') PRIMARY KEY,
            source_dataset VARCHAR,
            target_dataset VARCHAR,
            shared_column VARCHAR
        )
        """)

    def save_governance_result(
        self,
        column_name: str,
        pii: bool,
        risk: str,
        risk_score: int,
        tag: str
    ):
        """
        Store governance scan result.
        """

        self.conn.execute(
            """
            INSERT INTO governance_results
            (
                column_name,
                pii,
                risk,
                risk_score,
                tag
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            [column_name, pii, risk, risk_score, tag]
        )

    def save_lineage_relationship(
        self,
        source_dataset: str,
        target_dataset: str,
        shared_column: str
    ):
        """
        Store detected lineage relationship.
        """

        self.conn.execute(
            """
            INSERT INTO lineage_relationships
            (
                source_dataset,
                target_dataset,
                shared_column
            )
            VALUES (?, ?, ?)
            """,
            [source_dataset, target_dataset, shared_column]
        )

    def get_governance_results(self):
        """
        Return all governance records.
        """

        result = self.conn.execute(
            """
            SELECT *
            FROM governance_results
            """
        ).fetchall()

        return result

    def get_lineage_relationships(self):
        """
        Return all lineage relationships.
        """

        result = self.conn.execute(
            """
            SELECT *
            FROM lineage_relationships
            """
        ).fetchall()

        return result

    def save_connection(
        self,
        name: str,
        status: str,
        host: str = None,
        port: int = None,
        db_name: str = None,
        username: str = None
    ):
        """
        Create or update a database connection status.
        """
        self.conn.execute(
            """
            INSERT OR REPLACE INTO database_connections
            (
                name,
                status,
                host,
                port,
                db_name,
                username
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            [name, status, host, port, db_name, username]
        )

    def get_connections(self):
        """
        Return all connection configurations.
        """
        return self.conn.execute(
            """
            SELECT *
            FROM database_connections
            """
        ).fetchall()

    def close(self):
        """
        Close DuckDB connection.
        """

        self.conn.close()


# Singleton instance used across app
db = Database()
db.initialize()