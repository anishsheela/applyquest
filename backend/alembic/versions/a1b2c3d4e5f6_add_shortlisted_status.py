"""Add Shortlisted to applicationstatus enum

Revision ID: a1b2c3d4e5f6
Revises: 17f48ad2ceed
Create Date: 2026-04-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '17f48ad2ceed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'SHORTLISTED' BEFORE 'APPLIED'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values directly.
    # A full re-create would be needed; left as a no-op for safety.
    pass
