"""Initial schema with point history

Revision ID: 17f48ad2ceed
Revises: 
Create Date: 2026-02-08 09:48:07.910052

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '17f48ad2ceed'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create User table first (no dependencies)
    op.create_table('user',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('current_education', sa.String(), nullable=True),
    sa.Column('german_level', sa.String(), nullable=True),
    sa.Column('current_role', sa.String(), nullable=True),
    sa.Column('level', sa.Integer(), nullable=True),
    sa.Column('level_name', sa.String(), nullable=True),
    sa.Column('current_streak', sa.Integer(), nullable=True),
    sa.Column('longest_streak', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)

    # 2. Create Application table (depends on user)
    # We create it without the referral_contact_id foreign key constraint first
    op.create_table('application',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('company_name', sa.String(), nullable=False),
    sa.Column('position_title', sa.String(), nullable=False),
    sa.Column('location', sa.String(), nullable=False),
    sa.Column('job_url', sa.String(), nullable=True),
    sa.Column('salary_range', sa.String(), nullable=True),
    sa.Column('tech_stack', sa.String(), nullable=True),
    sa.Column('status', sa.Enum('APPLIED', 'REPLIED', 'PHONE_SCREEN', 'TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'GHOSTED', name='applicationstatus'), nullable=False),
    sa.Column('visa_sponsorship', sa.Boolean(), nullable=True),
    sa.Column('german_requirement', sa.Enum('NONE', 'BASIC', 'FLUENT', name='germanlevel'), nullable=True),
    sa.Column('relocation_support', sa.Boolean(), nullable=True),
    sa.Column('job_board_source', sa.String(), nullable=True),
    sa.Column('priority_stars', sa.Integer(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('applied_date', sa.Date(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('referral_contact_id', sa.UUID(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    # 3. Create NetworkContact table (depends on user and application)
    op.create_table('networkcontact',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('company', sa.String(), nullable=True),
    sa.Column('relationship_type', sa.String(), nullable=True),
    sa.Column('connection_strength', sa.Integer(), nullable=True),
    sa.Column('last_contact_date', sa.Date(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('application_id', sa.UUID(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['application_id'], ['application.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    # 4. Add the referral_contact_id foreign key constraint to application
    op.create_foreign_key(
        'fk_application_referral_contact',
        'application', 'networkcontact',
        ['referral_contact_id'], ['id'],
        ondelete='SET NULL'
    )

    # 5. Create ApplicationHistory table (depends on application)
    op.create_table('applicationhistory',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('application_id', sa.UUID(), nullable=False),
    sa.Column('old_status', sa.Enum('APPLIED', 'REPLIED', 'PHONE_SCREEN', 'TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'GHOSTED', name='applicationstatus'), nullable=True),
    sa.Column('new_status', sa.Enum('APPLIED', 'REPLIED', 'PHONE_SCREEN', 'TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 'FINAL_ROUND', 'OFFER', 'REJECTED', 'GHOSTED', name='applicationstatus'), nullable=False),
    sa.Column('changed_at', sa.DateTime(), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.ForeignKeyConstraint(['application_id'], ['application.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    # 6. Create PointHistory table (depends on user)
    op.create_table('pointhistory',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('points', sa.Integer(), nullable=False),
    sa.Column('reason', sa.String(), nullable=False),
    sa.Column('reference_type', sa.String(), nullable=True),
    sa.Column('reference_id', sa.UUID(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('pointhistory')
    op.drop_table('applicationhistory')
    op.drop_constraint('fk_application_referral_contact', 'application', type_='foreignkey')
    op.drop_table('networkcontact')
    op.drop_table('application')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
    # Types removal if needed, but usually they are reused
    op.execute('DROP TYPE applicationstatus')
    op.execute('DROP TYPE germanlevel')

