"""add login history table

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2025-05-15 13:21:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade():
    # Create login_history table
    op.create_table('login_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('login_time', sa.DateTime(), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('success', sa.Boolean(), nullable=False, server_default='1'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for user_id
    op.create_index(op.f('ix_login_history_user_id'), 'login_history', ['user_id'], unique=False)
    
    # Create index for login_time
    op.create_index(op.f('ix_login_history_login_time'), 'login_history', ['login_time'], unique=False)
    
    # Add last_login column to user table
    op.add_column('user', sa.Column('last_login', sa.DateTime(), nullable=True))


def downgrade():
    # Drop last_login column from user table
    op.drop_column('user', 'last_login')
    
    # Drop indexes
    op.drop_index(op.f('ix_login_history_login_time'), table_name='login_history')
    op.drop_index(op.f('ix_login_history_user_id'), table_name='login_history')
    
    # Drop login_history table
    op.drop_table('login_history')