"""add phone verification field to users

Revision ID: a1b2c3d4e5f6
Revises: previous_revision_id
Create Date: 2025-05-15 13:13:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'previous_revision_id'
branch_labels = None
depends_on = None


def upgrade():
    # Add a new column 'is_phone_verified' to the 'user' table
    op.add_column('user', sa.Column('is_phone_verified', sa.Boolean(), nullable=False, server_default='0'))
    
    # Example of adding an index
    op.create_index(op.f('ix_user_is_phone_verified'), 'user', ['is_phone_verified'], unique=False)
    
    # Example of data migration within a schema migration
    # This updates existing records to set is_phone_verified=True for users with a phone number
    op.execute("""
        UPDATE user 
        SET is_phone_verified = 1 
        WHERE phone IS NOT NULL AND phone != ''
    """)


def downgrade():
    # Remove the index first
    op.drop_index(op.f('ix_user_is_phone_verified'), table_name='user')
    
    # Then remove the column
    op.drop_column('user', 'is_phone_verified')